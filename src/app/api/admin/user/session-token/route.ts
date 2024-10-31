import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const Z_REQUEST = z.object({
  sessionToken: z.string(),
  secret: z.string()
});
//returns the expiry of a sessionToken
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

  const expiry = await prisma.session.findFirst({
    select: {expiry: true},
    where: {token: request.sessionToken}
  });

  if (!expiry) {
    return NextResponse.json({error: "Session token not found"}, {status: 400});
  }

  return NextResponse.json({expiry: expiry.expiry.valueOf()});
}

//removes a sessionToken from the session table
export async function DELETE(req: NextRequest) {
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

  const deletedToken = await prisma.session.delete({
    where: {token: request.sessionToken}
  });

  if (!deletedToken) {
    return NextResponse.json({error: "Session token not found"}, {status: 400});
  }

  return NextResponse.json({deletedToken});
}