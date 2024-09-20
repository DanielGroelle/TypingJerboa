import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { findUserFromLoginToken } from "../../admin/user/route";

const Z_REQUEST = z.object({
  loginToken: z.string(),
  sessionToken: z.string()
})
//associate lessons set under a session to be under a user
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

  const lessons = await prisma.lesson.findMany({
    where: {sessionToken: request.sessionToken}
  });

  const updatedLessons = await prisma.$transaction(
    lessons.map((lesson)=> 
      prisma.lesson.update({
        where: {id: lesson.id},
        data: {
          sessionToken: null,
          userId: user.id
        }
      })
    )
  );

  return NextResponse.json({updatedLessons});
}