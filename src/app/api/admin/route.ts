import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Z_REQUEST = z.object({
  token: z.string()
})
//check and return if user is an admin
export async function POST(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400})
  }

  const user = await prisma.user.findUnique({
    select: {admin: true},
    where: {sessionToken: request.token}
  })

  if (user?.admin === null) {
    return NextResponse.json({admin: false});
  }

  return NextResponse.json({admin: true});
}