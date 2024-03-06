import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Z_REQUEST = z.object({
  id: z.number(),
  text: z.string(),
  author: z.string(),
  source: z.string(),
  languageScriptId: z.number()
});
//edit paragraph
export default async function POST(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  const updatedParagraph = await prisma.paragraph.update({
    where: { id: request.id },
    data: {
      text: request.text,
      author: request.author,
      source: request.source,
      languageScriptId: request.languageScriptId
    }
  });

  if (updatedParagraph === null) {
    return NextResponse.json({error: "Paragraph ID does not exist"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({...updatedParagraph}));
}