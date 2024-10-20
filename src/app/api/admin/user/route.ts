import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

export async function getUsers() {
  const returnedUsers = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      admin: true,
      createdAt: true
    }
  });

  return returnedUsers;
}

//return all users
export async function GET() {
  const users = await getUsers();

  if (users === null) {
    return NextResponse.json({error: "Fetch users failed"}, {status: 400});
  }

  return NextResponse.json({users});
}

const Z_DELETE_REQUEST = z.object({
  id: z.number()
});
//delete single user
export async function DELETE(req: NextRequest) {
  let request;
  try {
    request = Z_DELETE_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  const deleteResult = await prisma.user.delete({
    where: {id: request.id}
  })

  if (deleteResult === null) {
    return NextResponse.json({error: "Delete was unsuccessful"}, {status: 400});
  }

  return NextResponse.json({deleteResult});
}

export async function findUserFromLoginToken(loginToken: string | undefined) {
  if (loginToken === undefined) return null;

  const user = await prisma.user.findFirst({
    where: {loginToken: loginToken}
  });
  
  return user;
}