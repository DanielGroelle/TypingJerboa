import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Z_PARAGRAPH = z.object({
  id: z.number(),
  text: z.string(),
  language_script_id: z.number(),
  author: z.string(),
  source: z.string()
});

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

  //get languageScriptId from languageScript
  const languageScriptId = await prisma.languageScript.findFirst({
    select: {id: true},
    where: {languageScript: request.languageScript}
  });
  if (languageScriptId === null) {
    return NextResponse.json({error: "LanguageScript not found"}, {status: 400});
  }

  //pick random paragraph based on languageScriptId
  //TODO: probably move this to a generalized function since right now this complex query is hidden away in /race/timer
  const randomParagraph: object[] = await prisma.$queryRaw`SELECT * FROM Paragraphs WHERE Language_script_id = ${languageScriptId.id} AND selectable = true OFFSET floor(random() * (SELECT COUNT(*) FROM Paragraphs WHERE Language_script_id = ${languageScriptId.id} and selectable = true)) LIMIT 1`;

  //if no paragraph found send back null data to be handled in startRace()
  if (randomParagraph[0] === undefined) {
    return new NextResponse(JSON.stringify({startTime: null, paragraphText: null, raceId: null}));
  }
  
  const chosenParagraph = Z_PARAGRAPH.parse(randomParagraph[0]);

  const createResult = await prisma.race.create({
    select: {
      id: true
    },
    data: {
      startTime: startTime,
      paragraphId: chosenParagraph.id
      //TODO: implement session tokens
    }
  });

  if (createResult === null) {
    return NextResponse.json({error: "Race creation failed"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({startTime, paragraphText: chosenParagraph.text, raceId: createResult.id}));
}