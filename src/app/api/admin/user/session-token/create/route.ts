import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";
import { z } from "zod";

const Z_REQUEST = z.object({
  secret: z.string()
});
//generate a sessionToken, and create a new session in the db
export async function POST(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  if (request.secret !== process.env.TOKEN_SECRET) {
    return NextResponse.json({error: "Not authorized for this action"}, {status: 400});
  }

  const sessionToken = randomBytes(32).toString("hex");
  const sixHoursMs = 1000 * 60 * 60 * 6;
  const newSession = await prisma.session.create({
    data: {
      token: sessionToken,
      expiry: new Date(Date.now() + sixHoursMs)
    }
  });

  if (newSession === null) {
    return NextResponse.json({error: "Unable to create new session"}, {status: 400});
  }

  return NextResponse.json({...newSession});
}