import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
//extracting words from paragraphs disabled
// import { extractWordsFromTexts, insertToWordTable } from "../../../utility/utility";
import { getLanguageScriptId } from "../../../../utility/utility";
import { z } from "zod";

const Z_REQUEST = z.object({
  source: z.string().nullable(),
  author: z.string().nullable(),
  texts: z.array(z.string()),
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
  const newParagraphs = request.texts.map(text => {
     return {
      source: request.source,
      author: request.author,
      text: text,
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