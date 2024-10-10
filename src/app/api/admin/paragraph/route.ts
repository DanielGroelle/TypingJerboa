import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { extractWordsFromTexts, getLanguageScriptId, insertToWordTable } from "../../utility/utility";

export async function getParagraphs() {
  return await prisma.paragraph.findMany({
    select: {
      id: true,
      text: true,
      author: true,
      source: true,
      languageScript: {select: {
        languageScript: true
      }},
      selectable: true
    }
  });
}

//return all paragraphs
export async function GET() {
  const returnedParagraphs = await getParagraphs();
  if (returnedParagraphs === null) {
    return NextResponse.json({error: "Fetch paragraphs failed"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({paragraphs: [...returnedParagraphs]}));
}

const Z_REQUEST = z.object({
  text: z.string(),
  source: z.string(),
  author: z.string(),
  languageScript: z.object({
    languageScript: z.string()
  }),
  selectable: z.boolean()
});
//create paragraph
export async function POST(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }
  console
  const languageScriptId = await getLanguageScriptId(request.languageScript.languageScript);
  if (languageScriptId === null) {
    return NextResponse.json({error: "LanguageScript does not exist"}, {status: 400});
  }

  const newParagraph = await prisma.paragraph.create({
    select: {
      id: true,
      text: true,
      source: true,
      author: true,
      languageScript: true,
      selectable: true
    },
    data: {
      text: request.text,
      source: request.source,
      author: request.author,
      languageScriptId: languageScriptId.id,
      selectable: request.selectable
    }
  });
  if (newParagraph === null) {
    return NextResponse.json({error: "Paragraph creation failed"}, {status: 400});
  }

  const words = extractWordsFromTexts([request.text]);
  const response = await insertToWordTable(words, languageScriptId.id);
  if (response === null) {
    return NextResponse.json({error: "Word insertion failed"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({...newParagraph}));
}

const Z_DELETE_REQUEST = z.object({
  id: z.number()
});
//delete paragraph
export async function DELETE(req: NextRequest) {
  let request;
  try {
    request = Z_DELETE_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  const deletedParagraph = await prisma.paragraph.delete({
    where: { id: request.id }
  });
  if (deletedParagraph === null) {
    return NextResponse.json({error: "Paragraph ID does not exist"}, {status: 400});
  }
  
  return NextResponse.json({status: 200});
}