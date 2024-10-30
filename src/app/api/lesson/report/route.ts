import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findUserFromLoginToken } from "../../admin/user/route";

const Z_REQUEST = z.object({
  lessonId: z.string()
});
//report lesson
export async function POST(req: NextRequest) {
  const loginToken = req.cookies.get("loginToken")?.value;
  const sessionToken = req.cookies.get("sessionToken")?.value;

  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  const lesson = await prisma.lesson.findFirst({
    where: {id: request.lessonId},
    select: {lessonText: true, id: true}
  });
  if (lesson === null) {
    return NextResponse.json({error: "Lesson not found from lessonId"}, {status: 404});
  }

  //check for duplicate reports on the same lesson
  const duplicateReport = await prisma.lessonReport.findFirst({
    where: {
      lesson: {id: lesson.id}
    }
  });
  if (duplicateReport) {
    return NextResponse.json({error: "Lesson already reported"}, {status: 400});
  }

  const user = await findUserFromLoginToken(loginToken);

  const report = await prisma.lessonReport.create({
    data: {
      lessonId: lesson.id,
      lessonText: lesson.lessonText,
      userId: user?.id,
      sessionToken: sessionToken
    }
  });
  if (report === null) {
    return NextResponse.json({error: "Error creating report"}, {status: 404});
  }
  
  return NextResponse.json({success: true});
}