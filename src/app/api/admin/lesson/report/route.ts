import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

async function getReports() {
  const returnedReports = await prisma.lessonReport.findMany({
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
  
  return returnedReports;
}
//return all lesson reports
export async function GET() {
  const returnedReports = await getReports();

  if (returnedReports === null) {
    return NextResponse.json({error: "Fetch reports failed"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({reports: [...returnedReports]}));
}

const Z_DELETE_REQUEST = z.object({
  id: z.number()
});
//delete single lesson report
export async function DELETE(req: NextRequest) {
  let request;
  try {
    request = Z_DELETE_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  const deleteResult = await prisma.lessonReport.delete({
    where: {id: request.id}
  })

  if (deleteResult === null) {
    return NextResponse.json({error: "Delete was unsuccessful"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({deleteResult}));
}