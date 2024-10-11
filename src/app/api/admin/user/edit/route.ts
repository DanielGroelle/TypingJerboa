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

  const userExistsOnAdminTable = await prisma.admin.findFirst({
    select: {id: true},
    where: {id: request.id}
  });
  const userIsAdmin = userExistsOnAdminTable !== null;

  let updatedAdmin;
  
  //if not changing the admin status of a user
  const updatedUser = await prisma.user.update({
    where: {id: request.id},
    data: {
      username: request.username || undefined
    },
    select: {
      id: true,
      username: true,
      createdAt: true
    }
  });

  if (request.admin !== userIsAdmin && request.admin !== null) {
    //add user to admin table
    if (request.admin) {
      //have to do this in two separate calls because prisma says so
      updatedAdmin = await prisma.admin.create({
        data: {id: request.id}
      });
    }
    //remove user from admin table
    else {
      //have to do this in two separate calls because prisma says so
      updatedAdmin = await prisma.admin.delete({
        where: {id: request.id}
      });
    }
    
  }

  if (updatedUser === null || updatedAdmin === null) {
    return NextResponse.json({error: "Failed to update user"}, {status: 400});
  }

  return NextResponse.json({...updatedUser, admin: updatedAdmin !== undefined});
}

//TODO: return if the user is an admin or not in the response