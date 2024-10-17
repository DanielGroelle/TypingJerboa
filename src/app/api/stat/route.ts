import prisma from "@/lib/prisma";
import { findUserFromLoginToken } from "../admin/user/route";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Z_REQUEST = z.object({
  languageScript: z.string()
});
//fetch user stats
export async function POST(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  //get the login/sessionToken from the users cookies if it exists
  const loginToken = req.cookies.get("loginToken")?.value;
  const sessionToken = req.cookies.get("sessionToken")?.value;

  const user = await findUserFromLoginToken(loginToken);

  const createdAt = user?.createdAt ?? null;
  
  const finishedRaces = await prisma.race.findMany({
    select: {
      startTime: true,
      endTime: true,
      mistakes: true,
      paragraph: {select: {text: true}}
    },
    orderBy: {
      endTime: "desc"
    },
    where: {
      OR: [
        {userId: user?.id},
        {sessionToken: sessionToken}
      ],
      endTime: {not: null},
      //if request.languageScript is "all", fetch races for all languageScripts
      paragraph:
        (request.languageScript === "all") ?
        undefined
        :
        {languageScript: {languageScript: request.languageScript}}
    }
  });

  if (finishedRaces === null) {
    return NextResponse.json({error: "No race stats found"}, {status: 404});
  }

  const raceCount = finishedRaces.length;

  //in case user has no races, return 0 for everything
  if (raceCount === 0) {
    const response = {races: 0, avgWpm: 0, avgMistakes: 0, bestWpm: 0, bestParagraph: null, createdAt};
    return new NextResponse(JSON.stringify(response));
  }

  let timeSum = 0;
  let wordSum = 0;
  let mistakeSum = 0;
  let races = 0
  const recentRacesRange = 50;
  //find the avgWpm and avgMistakes
  for (const race of finishedRaces.slice(0, recentRacesRange)) {
    if (!race.endTime || !race.mistakes) continue;

    timeSum += race.endTime.getTime() - race.startTime.getTime();
    wordSum += race.paragraph.text.length / 5;
    mistakeSum += race.mistakes;

    races++;
  }
  const avgWpm = wordSum / (timeSum / 1000 / 60);
  const avgMistakes = mistakeSum / races;

  //find the best wpm
  let bestWpm = 0;
  let bestParagraph = "";
  for (const race of finishedRaces) {
    if (!race.endTime) continue;
    const time = race.endTime.getTime() - race.startTime.getTime();
    const raceWpm = (race.paragraph.text.length / 5) / (time / 1000 / 60);

    if (raceWpm > bestWpm) {
      bestWpm = raceWpm;
      bestParagraph = race.paragraph.text;
    }
  }

  const response = {races: raceCount, avgWpm, avgMistakes, bestWpm, bestParagraph, createdAt};
  return new NextResponse(JSON.stringify(response));
}