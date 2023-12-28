import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Z_REQUEST = z.object({
  languageScript: z.string()
});
//start race and get paragraphText and startTime
export async function POST(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400})
  }

  //5 second countdown before start
  const startTime = new Date(Date.now() + 5000);

  //fetch the number of paragraphs for a given languageScript
  const languageScriptResult = await prisma.paragraph.findFirst({
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

  if (languageScriptResult === null) {
    return NextResponse.json({error: "LanguageScript not found"}, {status: 400});
  }

  //pick random paragraph index
  const lastParagraphIndex = languageScriptResult.languageScriptIndex;
  const chosenParagraphIndex = Math.floor(Math.random() * (lastParagraphIndex + 1));

  const languageScriptId = languageScriptResult.languageScriptId;

  //fetch the paragraph id and text
  const chosenParagraphIdTextResult = await prisma.paragraph.findFirst({
    select: {
      id: true,
      text: true
    },
    where: {
      languageScriptIndex: chosenParagraphIndex,
      languageScriptId: languageScriptId
    }
  });

  if (chosenParagraphIdTextResult === null) {
    return NextResponse.json({error: "Paragraph id not found"}, {status: 400});
  }

  const chosenParagraphId = chosenParagraphIdTextResult.id
  const chosenParagraphText = chosenParagraphIdTextResult.text;

  const createResult = await prisma.race.create({
    select: {
      id: true
    },
    data: {
      startTime: startTime,
      paragraphId: chosenParagraphId
      //TODO: implement session tokens
    }
  });

  if (createResult === null) {
    return NextResponse.json({error: "Race creation failed"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({startTime, paragraphText: chosenParagraphText, raceId: createResult.id}));
}