import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Z_REQUEST = z.object({
  id: z.number(),
  resolved: z.boolean()
});
//edit lesson report
export async function POST(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  const updatedReport = await prisma.lessonReport.update({
    where: { id: request.id },
    data: {
      resolved: request.resolved
    },
    select: {
      id: true,
      lesson: {
        select: {
          id: true,
          lessonText: true,
          lessonCharacters: true
        }
      },
      lessonText: true,
      user: {
        select: {
          id: true,
          username: true
        }
      },
      session: {
        select: {
          token: true
        }
      },
      resolved: true,
      createdAt: true
    }
  });
  if (updatedReport === null) {
    return NextResponse.json({error: "Report ID does not exist"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({...updatedReport}));
}