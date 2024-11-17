import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const Z_REQUEST = z.object({
  secret: z.string(),
  ip: z.string()
});
//check if ip is unique and add it to the visitors table if so
export async function POST(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  if (request.secret !== process.env.TOKEN_SECRET) {
    return NextResponse.json({error: "Not authorized for this action"}, {status: 401});
  }

  const ipUpsert = await prisma.visitor.upsert({
    where: {ip: request.ip},
    create: {ip: request.ip},
    update: {}
  })

  if (ipUpsert === null) {
    return NextResponse.json({error: "Error adding visitor"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({success: true}));
}