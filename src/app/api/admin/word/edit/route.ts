import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getLanguageScriptId } from "@/app/api/utility/utility";

const Z_REQUEST = z.object({
  id: z.number(),
  word: z.string(),
  languageScript: z.object({
    languageScript: z.string()
  })
});
//edit any value of a word
export async function POST(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400})
  }

 const languageScriptId = await getLanguageScriptId(request.languageScript.languageScript);
 if (languageScriptId === null) {
  return NextResponse.json({error: "Could not find languageScript"}, {status: 400});
}
   
  const updatedWord = await prisma.word.update({
    where: {id: request.id},
    data: {
      word: request.word,
      languageScriptId: languageScriptId.id
    },
    select: {
      id: true,
      word: true,
      languageScript: true
    }
  });
  if (updatedWord === null) {
    return NextResponse.json({error: "Failed to update word"}, {status: 400});
  }

  return NextResponse.json({...updatedWord});
}