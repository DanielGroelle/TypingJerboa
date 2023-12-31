import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

export async function getUsers() {
  const returnedUsers = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      admin: true
    }
  });
  
  //convert admin data to a simple true or false
  const users = returnedUsers.map((user)=>{return {...user, admin: user.admin !== null}});

  return users;
}

//return all users
export async function GET() {
  const users = await getUsers();

  if (users === null) {
    return NextResponse.json({error: "Fetch users failed"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({users}));
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

  //TODO: delete associated session token and races

  return NextResponse.json({deleteResult});
}

//return if a single user is an admin based on sessionToken
export async function userIsAdmin(token: string) {
  const user = await prisma.user.findUnique({
    select: {id: true},
    where: {sessionToken: token}
  });

  //no user found
  if (user === null) {
    return false;
  }

  return await prisma.admin.findUnique({where: {id: user.id}}) !== null;
}

const Z_POST_REQUEST = z.object({
  token: z.string() 
});
//TODO: probably move this somewhere else
//return if single user is admin or not
export async function POST(req: NextRequest) {
  let request;
  try {
    request = Z_POST_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  const isAdmin = await userIsAdmin(request.token);

  return NextResponse.json({isAdmin});
}