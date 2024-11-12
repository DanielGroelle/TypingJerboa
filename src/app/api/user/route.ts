import { NextRequest, NextResponse } from "next/server";
import { findUserFromLoginToken } from "../admin/user/route";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { comparePassword, hashPassword } from "@/lib/bcrypt";

//delete user and all associated data from db
export async function DELETE(req: NextRequest) {
  //get the login from the users cookies if it exists
  const loginToken = req.cookies.get("loginToken")?.value;

  const user = await findUserFromLoginToken(loginToken);
  if (user === null) {
    return NextResponse.json({error: "User not found from login token"}, {status: 400});
  }

  const deleteUser = await prisma.user.delete({
    where: {
      id: user.id
    }
  });

  if (!deleteUser) {
    return NextResponse.json({error: "Error deleting user"}, {status: 400});
  }

  return NextResponse.json({success: true});
}

const Z_REQUEST = z.object({
  unhashedCurrentPassword: z.string(),
  unhashedNewPassword: z.string()
});
//update user password
export async function POST(req: NextRequest) {
  //get the login from the users cookies if it exists
  const loginToken = req.cookies.get("loginToken")?.value;

  const user = await findUserFromLoginToken(loginToken);
  if (user === null) {
    return NextResponse.json({error: "User not found from login token"}, {status: 400});
  }

  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400})
  }

  if (!await comparePassword(request.unhashedCurrentPassword, user.password)) {
    return NextResponse.json({error: "Password is not correct"}, {status: 401});
  }

  const hashedPassword = await hashPassword(request.unhashedNewPassword);

  const newUserPassword = await prisma.user.update({
    data: {
      password: hashedPassword
    },
    where: {id: user.id},
    select: {
      username: true,
      createdAt: true
    }
  });

  if (newUserPassword === null) {
    return NextResponse.json({error: "Password update failed"}, {status: 400});
  }

  return NextResponse.json({success: true});
}