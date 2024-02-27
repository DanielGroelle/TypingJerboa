import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";
import { comparePassword } from "@/lib/bcrypt";
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
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  const returnedUser = await prisma.user.findFirst({
    select: {
      id: true,
      username: true,
      password: true
    }, 
    where: {username: request.username}
  })

  if (returnedUser === null) {
    return NextResponse.json({error: "Username or password is not correct"}, {status: 401});
  }

  if (!await comparePassword(request.unhashedPassword, returnedUser.password)) {
    return NextResponse.json({error: "Username or password is not correct"}, {status: 401});
  }

  //create and send token
  const token = createId();
  const dayMs = 1000 * 60 * 60 * 24;

  const createdSession = await prisma.session.create({
    data: {
      token: token,
      expiry: new Date(Date.now() + dayMs),
      user: {
        connect: {
          id: returnedUser.id
        }
      }
    }
  });

  if (createdSession === null) {
    return NextResponse.json({error: "Failed to create session"}, {status: 400});
  }

  const response = new NextResponse();
  response.cookies.set("token", token, {
    httpOnly: true
  });
  return response;
}