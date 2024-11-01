import prisma from "@/lib/prisma";
import { findUserFromLoginToken } from "../admin/user/route";
import { NextRequest, NextResponse } from "next/server";
import { LanguageScripts } from "@/js/language-scripts";

//fetch user stats
export async function GET(req: NextRequest) {
  //get the login/sessionToken from the users cookies if it exists
  const loginToken = req.cookies.get("loginToken")?.value;
  const sessionToken = req.cookies.get("sessionToken")?.value;

  const user = await findUserFromLoginToken(loginToken);

  const createdAt = user?.createdAt ?? null;
  
  const fetchedFinishedRaces = await prisma.race.findMany({
    select: {
      startTime: true,
      endTime: true,
      mistakes: true,
      paragraph: {select: {
        text: true,
        languageScript: {select: {
          languageScript: true
        }}
      }}
    },
    orderBy: {
      endTime: "desc"
    },
    where: {
      OR: [
        {userId: user?.id},
        {sessionToken: sessionToken}
      ],
      endTime: {not: null}
    }
  });
  if (fetchedFinishedRaces === null) {
    return NextResponse.json({error: "No race stats found"}, {status: 404});
  }

  type Stats = {
    races: number;
    avgWpm: number;
    avgMistakes: number;
    bestWpm: number;
    bestParagraph: string | null;
    createdAt: Date | null;
  };

  const languageScriptStats: Partial<Record<keyof typeof LanguageScripts, Stats>> & {all: Stats} = {
    all: {
      races: 0,
      avgWpm: 0,
      avgMistakes: 0,
      bestWpm: 0,
      bestParagraph: null,
      createdAt: null
    }
  };

  //iterate over languageScripts to compute stat values for the respective languageScript
  for (const value of [...Object.values(LanguageScripts), {internal: "all"} as const]) {
    const filteredRaces = fetchedFinishedRaces.filter(race => value.internal === "all" || race.paragraph.languageScript.languageScript === value.internal);
    const raceCount = filteredRaces.length;

    //in case user has no finished races, return 0 for everything
    if (raceCount === 0) {
      languageScriptStats[value.internal] = {races: 0, avgWpm: 0, avgMistakes: 0, bestWpm: 0, bestParagraph: null, createdAt};
      continue;
    }

    let timeSum = 0;
    let wordSum = 0;
    let mistakeSum = 0;
    let races = 0
    const recentRacesRange = 50;
    //find the avgWpm and avgMistakes
    for (const race of filteredRaces.slice(0, recentRacesRange)) {
      if (race.endTime === null || race.mistakes === null) continue;

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
    for (const race of filteredRaces) {
      if (!race.endTime) continue;
      const time = race.endTime.getTime() - race.startTime.getTime();
      const raceWpm = (race.paragraph.text.length / 5) / (time / 1000 / 60);

      if (raceWpm > bestWpm) {
        bestWpm = raceWpm;
        bestParagraph = race.paragraph.text;
      }
    }

    languageScriptStats[value.internal] = {
      races: raceCount,
      avgWpm,
      avgMistakes,
      bestWpm,
      bestParagraph,
      createdAt
    };
  }

  return new NextResponse(JSON.stringify(languageScriptStats));
}