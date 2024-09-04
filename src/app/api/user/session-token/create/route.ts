import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";

//generate a sessionToken, and create a new session in the db
export async function GET() {
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