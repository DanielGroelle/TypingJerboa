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
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400})
  }

  //update the race with the endTime and the mistakes
  const raceFinishResult = await prisma.race.update({
    where: {id: request.raceId},
    data: {
      mistakes: request.mistakes,
      endTime: new Date(request.endTime)
    }
  });

  if (raceFinishResult === null) {
    return NextResponse.json({error: "Race finish failed"}, {status: 400})
  }

  return new NextResponse(JSON.stringify({raceFinishResult}));
}