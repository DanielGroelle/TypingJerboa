import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import {hashPassword} from "@/lib/bcrypt";

const Z_REQUEST = z.object({
  username: z.string(),
  unhashedPassword: z.string()
});
//create new user
export async function POST(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400})
  }

  //check if username is already taken
  const usernameMatchResult = await prisma.user.findUnique({
    where: {
      username: request.username
    }
  })

  if (usernameMatchResult !== null) {
    return NextResponse.json({error: "Username taken"}, {status: 400});
  }

  const hashedPassword = await hashPassword(request.unhashedPassword);

  const newUser = await prisma.user.create({
    data: {
      username: request.username,
      password: hashedPassword
    }
  })

  if (newUser === null) {
    return NextResponse.json({error: "User creation failed"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({newUser}));
}