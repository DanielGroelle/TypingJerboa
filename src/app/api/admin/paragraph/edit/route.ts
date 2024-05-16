import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Z_REQUEST = z.object({
  id: z.number(),
  text: z.string(),
  author: z.string(),
  source: z.string(),
  languageScript: z.string(),
  selectable: z.boolean()
});
//edit paragraph
export async function POST(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  //TODO: move this to a general function
  const languageScriptId = await prisma.languageScript.findFirst({
    select: {id: true},
    where: {languageScript: request.languageScript}
  });
  if (languageScriptId === null) {
    return NextResponse.json({error: "LanguageScript does not exist"}, {status: 400});
  }

  const currentLanguageScript = await prisma.paragraph.findFirst({
    select: {
      languageScript: true
    },
    where: {id: request.id}
  });
  if (currentLanguageScript === null) {
    return NextResponse.json({error: "Paragraph id does not exist"}, {status: 400});
  }

  const updatedParagraph = await prisma.paragraph.update({
    select: {
      id: true,
      text: true,
      author: true,
      source: true,
      languageScript: true,
      selectable: true
    },
    where: { id: request.id },
    data: {
      text: request.text,
      author: request.author,
      source: request.source,
      languageScriptId: languageScriptId.id,
      selectable: request.selectable
    }
  });
  if (updatedParagraph === null) {
    return NextResponse.json({error: "Paragraph ID does not exist"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({...updatedParagraph}));
}