import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getLanguageScriptId } from "../../../utility/utility";

const Z_REQUEST = z.object({
  source: z.string(),
  author: z.string(),
  texts: z.array(z.string()),
  languageScript: z.string(),
  selectable: z.boolean()
});
//bulk create paragraphs
export async function POST(req: NextRequest) {
  const tryRequest = Z_REQUEST.safeParse(await req.json());
  if (!tryRequest.success) {
    console.log(tryRequest.error)
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }
  const request = tryRequest.data;

  const languageScriptId = await getLanguageScriptId(request.languageScript);
  if (languageScriptId === null) {
    return NextResponse.json({error: "LanguageScript does not exist"}, {status: 400});
  }

  const Z_PARAGRAPH = z.object({
    text: z.string(),
    author: z.string(),
    source: z.string(),
    languageScriptId: z.number(),
    selectable: z.boolean()
  });
  type Paragraph = z.infer<typeof Z_PARAGRAPH>;

  //format into a neat array of objects for prisma to createMany with
  const newParagraphs = [] as Paragraph[];
  request.texts.forEach((text)=>{
     newParagraphs.push({
      source: request.source,
      author: request.author,
      selectable: request.selectable,
      text: text,
      languageScriptId: languageScriptId.id,
    });
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

  const deletedParagraphCount = await prisma.paragraph.deleteMany({
    where: {
      id: {in: request.ids}
    }
  });

  if (deletedParagraphCount === null) {
    return NextResponse.json({error: "Paragraph ID does not exist"}, {status: 400});
  }
  
  return NextResponse.json({status: 200});
}