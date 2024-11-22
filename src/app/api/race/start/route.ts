import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findUserFromLoginToken, selectRandomParagraph } from "../../utility/utility";

const Z_PARAGRAPH = z.object({
  id: z.number(),
  text: z.string(),
  language_script_id: z.number(),
  author: z.string().nullable(),
  source: z.string().nullable()
});

const Z_REQUEST = z.object({
  languageScript: z.string()
});
//start race and get paragraphText and startTime
export async function POST(req: NextRequest) {
  //get the login/sessionToken from the users cookies if it exists
  const loginToken = req.cookies.get("loginToken")?.value;
  const sessionToken = req.cookies.get("sessionToken")?.value;

  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
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

  const randomParagraph = await selectRandomParagraph(languageScriptId.id);

  //if no paragraph found send back null data to be handled in startRace()
  if (randomParagraph === undefined) {
    return new NextResponse(JSON.stringify({startTime: null, paragraphText: null, raceId: null}));
  }
  
  let chosenParagraph;
  try {
    chosenParagraph = Z_PARAGRAPH.parse(randomParagraph);
  }
  catch(e: unknown) {
    console.error("Select paragraph error", e);
    return NextResponse.json({error: "Paragraph selection failed"}, {status: 400});
  }

  const user = await findUserFromLoginToken(loginToken);

  const createResult = await prisma.race.create({
    select: {
      id: true
    },
    data: {
      startTime: startTime,
      paragraphId: chosenParagraph.id,
      userId: user?.id,
      sessionToken: sessionToken ?? null
    }
  });

  return new NextResponse(JSON.stringify({startTime, paragraph: {text: chosenParagraph.text, author: chosenParagraph.author, source: chosenParagraph.source}, raceId: createResult.id}));
}