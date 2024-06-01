import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const Z_REQUEST = z.object({
  sessionToken: z.string()
});
//create a new session in the db using given sessionToken
export async function POST(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  const sixHoursMs = 1000 * 60 * 60 * 6;
  const newSession = await prisma.session.create({
    data: {
      token: request.sessionToken,
      expiry: new Date(Date.now() + sixHoursMs)
    }
  });

  if (newSession === null) {
    return NextResponse.json({error: "Unable to create new session"}, {status: 400});
  }

  return NextResponse.json({...newSession})
}