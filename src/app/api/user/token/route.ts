import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const Z_REQUEST = z.object({
  token: z.string()
});
//returns the expiry of a session token
export async function POST(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  const expiry = await prisma.session.findFirst({
    select: {expiry: true},
    where: {token: request.token}
  });

  if (!expiry) {
    return NextResponse.json({error: "Token not found"}, {status: 400})
  }

  return NextResponse.json({expiry: expiry.expiry.valueOf()});
}