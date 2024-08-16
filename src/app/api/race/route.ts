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
      paragraph: {select: {text: true}}
    },
    where: {id: request.id}
  });

  if (raceData === null) {
    return NextResponse.json({error: "Race not found"}, {status: 404});
  }

  let username = raceData?.user?.username;
  if (!username) {
    username = "";
  }

  const response = {...raceData, user: username, paragraph: raceData.paragraph.text};
  return new NextResponse(JSON.stringify(response));
}