import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const Z_REQUEST = z.object({
  loginToken: z.string(),
  secret: z.string()
});
//returns the expiry of a loginToken
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

  const expiry = await prisma.user.findFirst({
    select: {loginExpiry: true},
    where: {loginToken: request.loginToken}
  });

  if (expiry === null || expiry?.loginExpiry === null) {
    return NextResponse.json({error: "Expiry is null"}, {status: 400});
  }

  return NextResponse.json({expiry: expiry.loginExpiry.valueOf()});
}

//removes a loginToken from the login table
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

  const updatedUser = await prisma.user.update({
    where: {loginToken: request.loginToken},
    data: {
      loginToken: null,
      loginExpiry: null
    }
  });

  if (!updatedUser) {
    return NextResponse.json({error: "Login token not found"}, {status: 400});
  }

  return NextResponse.json({updatedUser});
}