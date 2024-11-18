import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
//extracting words from paragraphs disabled
// import { extractWordsFromTexts, insertToWordTable } from "../../../utility/utility";
import { getLanguageScriptId } from "../../../utility/utility";
import { z } from "zod";

const Z_REQUEST = z.object({
  texts: z.array(z.object({
    text: z.string(),
    source: z.string().nullable(),
    author: z.string().nullable()
  })),
  languageScript: z.string(),
  selectable: z.boolean()
});
//bulk create paragraphs
export async function POST(req: NextRequest) {
  const tryRequest = Z_REQUEST.safeParse(await req.json());
  if (!tryRequest.success) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }
  const request = tryRequest.data;

  const languageScriptId = await getLanguageScriptId(request.languageScript);
  if (languageScriptId === null) {
    return NextResponse.json({error: "LanguageScript does not exist"}, {status: 400});
  }

  //format into a neat array of objects for prisma to createMany with
  const newParagraphs = request.texts.map(paragraph => {
     return {
      source: paragraph.source,
      author: paragraph.author,
      text: paragraph.text,
      languageScriptId: languageScriptId.id,
      selectable: request.selectable
    };
  });

  const newParagraphsReturned = await prisma.paragraph.createManyAndReturn({
    select: {
      id: true,
      author: true,
      source: true,
      text: true,
      languageScript: true,
      selectable: true
    },
    data: newParagraphs
  });

  if (newParagraphsReturned === null) {
    return NextResponse.json({error: "Paragraph creation failed"}, {status: 400});
  }

  //disabled since the introduction of bulk inserting words
  // const words = extractWordsFromTexts(request.texts);
  // const response = await insertToWordTable(words, languageScriptId.id);
  // if (response === null) {
  //   return NextResponse.json({error: "Word insertion failed"}, {status: 400});
  // }
  // console.log("Words attempted to insert", response);

  return new NextResponse(JSON.stringify({data: [...newParagraphsReturned]}));
}

const Z_DELETE_REQUEST = z.object({
  ids: z.array(z.number())
});
//bulk delete paragraphs
export async function DELETE(req: NextRequest) {
  let request;
  try {
    request = Z_DELETE_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  let deletedParagraphCount = 0;
  //in case bulk paragraph deletion exceeds 30,000 words, break into 30k chunks
  for (let i = 0; i < request.ids.length; i += 30000) {
    const ids = request.ids.slice(i, i + 30000);
    const batchDeletedParagraphs = await prisma.paragraph.deleteMany({
      where: {
        id: {in: ids}
      }
    });

    deletedParagraphCount += batchDeletedParagraphs.count;
  }

  console.log("Paragraphs deleted", deletedParagraphCount);
  return NextResponse.json({status: 200});
}