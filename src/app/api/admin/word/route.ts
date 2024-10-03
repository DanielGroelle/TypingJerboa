import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getLanguageScriptId } from "../../utility/utility";

export async function getWords() {
  const returnedWords = await prisma.word.findMany({
    select: {
      id: true,
      word: true,
      languageScript: {
        select: {
          languageScript: true
        }
      }
    }
  });
  
  return returnedWords;
}
//return all words
export async function GET() {
  const returnedWords = await getWords();

  if (returnedWords === null) {
    return NextResponse.json({error: "Fetch words failed"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({words: [...returnedWords]}));
}

const Z_REQUEST = z.object({
  word: z.string(),
  languageScript: z.string()
});
//create word
export async function POST(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  const languageScriptId = await getLanguageScriptId(request.languageScript);
  if (languageScriptId === null) {
    return NextResponse.json({error: "LanguageScript does not exist"}, {status: 400});
  }

  const newWord = await prisma.word.create({
    select: {
      id: true,
      word: true,
      languageScript: true
    },
    data: {
      word: request.word,
      languageScriptId: languageScriptId.id
    }
  });
  if (newWord === null) {
    return NextResponse.json({error: "Word creation failed"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({...newWord}));
}

const Z_DELETE_REQUEST = z.object({
  id: z.number()
});
//delete single word
export async function DELETE(req: NextRequest) {
  let request;
  try {
    request = Z_DELETE_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  const deleteResult = await prisma.word.delete({
    where: {id: request.id}
  })

  if (deleteResult === null) {
    return NextResponse.json({error: "Delete was unsuccessful"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({deleteResult}));
}