import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { findUserFromLoginToken } from "../../admin/user/route";

const Z_REQUEST = z.object({
  loginToken: z.string(),
  sessionToken: z.string()
})
//associate races set under a session to be under a user
export async function POST(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  const user = await findUserFromLoginToken(request.loginToken);
  if (user === null) {
    return NextResponse.json({error: "User not found from login token"}, {status: 400});
  }

  const races = await prisma.race.findMany({
    where: {sessionToken: request.sessionToken}
  });

  const updatedRaces = await prisma.$transaction(
    races.map((race)=> 
      prisma.race.update({
        where: {id: race.id},
        data: {
          sessionToken: null,
          userId: user.id
        }
      })
    )
  );

  return NextResponse.json({updatedRaces});
}