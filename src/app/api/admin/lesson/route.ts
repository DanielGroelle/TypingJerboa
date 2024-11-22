import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

async function getLessons() {
  const returnedLessons = await prisma.lesson.findMany({
    select: {
      id: true,
      languageScript: {
        select: {languageScript: true}
      },
      startTime: true,
      endTime: true,
      lessonCharacters: true,
      lessonText: true,
      mode: true,
      mistakes: true,
      user: {
        select: {
          id: true,
          username: true
        }
      },
      session: {select: {token: true}}
    }
  });
  
  return returnedLessons;
}

//return all lessons
export async function GET() {
  const returnedLessons = await getLessons();

  if (returnedLessons === null) {
    return NextResponse.json({error: "Fetch lessons failed"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({lessons: [...returnedLessons]}));
}

const Z_REQUEST = z.object({
  id: z.string()
});
//delete single lesson
export async function DELETE(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  const deleteResult = await prisma.lesson.delete({
    where: {id: request.id}
  })

  if (deleteResult === null) {
    return NextResponse.json({error: "Delete was unsuccessful"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({deleteResult}));
}