import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Z_REQUEST = z.object({
  mistakes: z.number(),
  endTime: z.string(),
  raceId: z.string()
});
//end race
export async function POST(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  const currentRace = await prisma.race.findFirst({
    where: {id: request.raceId},
    select: {startTime: true}
  });
  if (currentRace === null) {
    return NextResponse.json({error: "Race ID not found"}, {status: 400});
  }

  if (new Date(request.endTime).getTime() <= currentRace.startTime.getTime()) {
    return NextResponse.json({error: "Race endTime cannot be before startTime"}, {status: 400});
  }

  //update the race with the endTime and the mistakes
  const raceFinishResult = await prisma.race.update({
    select: {
      id: true,
      startTime: true,
      endTime: true,
      mistakes: true,
      paragraph: {
        select: {
          text: true,
          author: true,
          source: true
        }
      }
    },
    where: {id: request.raceId},
    data: {
      mistakes: request.mistakes,
      endTime: new Date(request.endTime)
    }
  });

  if (raceFinishResult === null) {
    return NextResponse.json({error: "Race finish failed"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({raceFinishResult}));
}