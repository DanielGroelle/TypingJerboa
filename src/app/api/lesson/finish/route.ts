import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Z_REQUEST = z.object({
  endTime: z.string(),
  lessonId: z.string()
});
//end lesson
export async function POST(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  //update the lesson with the endTime
  const lessonFinishResult = await prisma.lesson.update({
    where: {id: request.lessonId},
    data: {
      endTime: new Date(request.endTime)
    }
  });

  if (lessonFinishResult === null) {
    return NextResponse.json({error: "Lesson finish failed"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({lessonFinishResult}));
}