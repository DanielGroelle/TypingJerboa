import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Z_REQUEST = z.object({
  id: z.string()
});
//fetch race data
export async function POST(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  const raceData = await prisma.race.findFirst({
    select: {
      user: {select: {username: true}},
      startTime: true,
      endTime: true,
      mistakes: true,
      paragraph: {
        select: {
          text: true,
          author: true,
          source: true,
          languageScript: true
        }
      },
      sessionToken: true,
      userId: true
    },
    where: {id: request.id}
  });

  if (raceData === null) {
    return NextResponse.json({error: "Race not found"}, {status: 404});
  }

  if (raceData.endTime === null) {
    return NextResponse.json({error: "Race not finished"}, {status: 400});
  }

  //fetch all previous user races in the languageScript
  const allRaces = await prisma.race.findMany({
    select: {
      startTime: true,
      endTime: true
    },
    where: {
      sessionToken: raceData.sessionToken,
      userId: raceData.userId,
      paragraph: {
        languageScriptId: raceData.paragraph.languageScript.id
      },
      endTime: {lt: raceData.endTime},
      NOT: {endTime: null}
    }
  });

  //check if this time is a new best
  let bestTime = Infinity
  const currentTime = new Date(raceData.endTime).getTime() - raceData.startTime.getTime();
  for (const race of allRaces) {
    if (!race.endTime) continue;
    
    const time = race.endTime.getTime() - race.startTime.getTime();
    if (time < bestTime) {
      bestTime = time;
      break;
    }
  }

  let newBestTime = false;
  if (currentTime < bestTime) newBestTime = true; 

  const username = raceData?.user?.username ?? null;

  const returnedRaceData = {
    user: username,
    paragraph: {
      text: raceData.paragraph.text,
      author: raceData.paragraph.author,
      source: raceData.paragraph.source,
      languageScript: raceData.paragraph.languageScript.languageScript
    },
    startTime: raceData.startTime,
    endTime: raceData.endTime,
    mistakes: raceData.mistakes,
    newBest: newBestTime
  };
  return new NextResponse(JSON.stringify({...returnedRaceData}));
}