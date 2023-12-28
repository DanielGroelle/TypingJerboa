import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {comparePassword} from "@/lib/bcrypt";
import prisma from "@/lib/prisma";

const Z_REQUEST = z.object({
  username: z.string(),
  unhashedPassword: z.string()
});
//check username and password
export async function POST(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400})
  }

  const returnedUser = await prisma.user.findFirst({
    select: {password: true}, 
    where: {username: request.username}
  })

  if (returnedUser === null) {
    return NextResponse.json({error: "Username not found"}, {status: 400});
  }

  const hashedPassword = returnedUser.password as string;

  if (!await comparePassword(request.unhashedPassword, hashedPassword)) {
    return NextResponse.json({error: "Password incorrect"}, {status: 400});
  }

  //TODO: give user a session token and a cookie to remember theyre logged in

  return new NextResponse(JSON.stringify({success: "yay"}));
}