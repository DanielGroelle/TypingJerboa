import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

async function getRaces() {
  const returnedRaces = await prisma.race.findMany({
    select: {
      id: true,
      startTime: true,
      endTime: true,
      mistakes: true,
      paragraph: {
        select: {
          text: true,
          languageScript: {select: {languageScript: true}}
        }
      },
      user: {
        select: {id: true, username: true}
      },
      session: {
        select: {token: true}
      }
    }
  })
  
  return returnedRaces;
}
//return all races
export async function GET() {
  const returnedRaces = await getRaces();

  if (returnedRaces === null) {
    return NextResponse.json({error: "Fetch races failed"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({races: [...returnedRaces]}));
}

const Z_REQUEST = z.object({
  id: z.string()
});
//delete single race
export async function DELETE(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  const deleteResult = await prisma.race.delete({
    where: {id: request.id}
  })

  if (deleteResult === null) {
    return NextResponse.json({error: "Delete was unsuccessful"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({deleteResult}));
}