import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { findUserFromLoginToken } from "../admin/user/route";

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