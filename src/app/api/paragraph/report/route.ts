import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findUserFromLoginToken } from "../../admin/user/route";

const Z_REQUEST = z.object({
  raceId: z.string()
});
//report paragraph
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

  const race = await prisma.race.findFirst({
    where: {id: request.raceId},
    select: {paragraph: true}
  });
  if (race === null) {
    return NextResponse.json({error: "Race not found from raceId"}, {status: 404});
  }

  const user = await findUserFromLoginToken(loginToken);

  //check for duplicate reports from the same user/session on the same paragraph
  const duplicateReport = await prisma.paragraphReport.findFirst({
    where: {
      user: {id: user?.id},
      session: {token: sessionToken},
      paragraph: {id: race.paragraph.id}
    }
  });
  if (duplicateReport) {
    return NextResponse.json({error: "Paragraph already reported"}, {status: 400});
  }

  const report = await prisma.paragraphReport.create({
    data: {
      paragraphId: race.paragraph.id,
      paragraphText: race.paragraph.text,
      userId: user?.id,
      sessionToken: sessionToken
    }
  });
  if (report === null) {
    return NextResponse.json({error: "Error creating report"}, {status: 404});
  }
  
  return NextResponse.json({success: true});
}