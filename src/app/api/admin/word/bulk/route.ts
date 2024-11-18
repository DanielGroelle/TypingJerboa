import prisma from "@/lib/prisma";
import { getLanguageScriptId, insertToWordTable } from "@/app/api/utility/utility";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Z_REQUEST = z.object({
  words: z.array(z.string()),
  languageScript: z.string(),
});
//bulk create words
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

  console.log(request.words.length)
  const response = await insertToWordTable(request.words, languageScriptId.id);
  if (response === null) {
    return NextResponse.json({error: "Word insertion failed"}, {status: 400});
  }
  console.log("Words attempted to insert", response);

  const allWords = await prisma.word.findMany({
    select: {
      id: true,
      word: true,
      languageScript: {select: {languageScript: true}}
    }
  });

  return new NextResponse(JSON.stringify({data: [...allWords]}));
}

const Z_DELETE_REQUEST = z.object({
  ids: z.array(z.number())
});
//bulk delete words
export async function DELETE(req: NextRequest) {
  let request;
  try {
    request = Z_DELETE_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  let deletedWordCount = 0;
  //in case bulk word deletion exceeds 30,000 words, break into 30k chunks
  for (let i = 0; i < request.ids.length; i += 30000) {
    const ids = request.ids.slice(i, i + 30000);
    const batchDeletedWords = await prisma.word.deleteMany({
      where: {
        id: {in: ids}
      }
    });

    deletedWordCount += batchDeletedWords.count;
  }

  console.log("Words deleted", deletedWordCount);
  return NextResponse.json({status: 200});
}