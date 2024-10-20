import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const Z_REQUEST = z.object({
  id: z.number(),
  username: z.string().nullable(),
  admin: z.boolean().nullable(),
  createdAt: z.string().nullable()
});
//edit any value of a user
export async function POST(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400})
  }
   
  const updatedUser = await prisma.user.update({
    where: {id: request.id},
    data: {
      username: request.username || undefined,
      admin: request.admin || undefined
    },
    select: {
      id: true,
      username: true,
      createdAt: true,
      admin: true
    }
  });
  if (updatedUser === null) {
    return NextResponse.json({error: "Failed to update user"}, {status: 400});
  }

  return NextResponse.json({...updatedUser});
}