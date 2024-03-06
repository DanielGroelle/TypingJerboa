import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function getParagraphs() {
  const returnedParagraphs = await prisma.paragraph.findMany({
    select: {
      id: true,
      text: true,
      author: true,
      source: true,
      languageScript: true,
      languageScriptIndex: true
    }
  })
  
  return returnedParagraphs;
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
  languageScript: z.string()
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

  const languageScriptData = await prisma.paragraph.findFirst({
    select: {
      languageScriptIndex: true,
      languageScriptId: true
    },
    where: {
      languageScript: {
        languageScript: request.languageScript
      }
    },
    orderBy: {
      languageScriptIndex: "desc"
    }
  });

  if (languageScriptData === null) {
    return NextResponse.json({error: "Language script does not exist"}, {status: 400});
  }

  const newParagraph = await prisma.paragraph.create({
    data: {
      text: request.text,
      source: request.source,
      author: request.author,
      languageScriptIndex: languageScriptData.languageScriptIndex,
      languageScriptId: languageScriptData.languageScriptId
    }
  });

  if (newParagraph === null) {
    return NextResponse.json({error: "Paragraph creation failed"}, {status: 400});
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

  //find the id of the lastIndexParagraph
  const lastIndexParagraph = await prisma.paragraph.findFirst({
    select: { id: true },
    where: { languageScriptId: deletedParagraph.languageScriptId },
    orderBy: { languageScriptIndex: "desc" }
  });

  if (lastIndexParagraph === null) {
    return NextResponse.json({error: "Error finding last index paragraph"}, {status: 400});
  }

  //replace the lastIndexParagraph's index with the deleted paragraph's index so there are no gaps in indexes for a given languageScript
  const movedParagraph = await prisma.paragraph.update({
    where: { id: lastIndexParagraph.id },
    data: { languageScriptIndex: deletedParagraph.languageScriptIndex }
  });

  if (movedParagraph === null) {
    return NextResponse.json({error: "Error reassigning last index paragraph"}, {status: 400});
  }
  
  return NextResponse.json({status: 200});
}