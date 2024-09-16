import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

//return if a single user is an admin based on loginToken
export async function userIsAdmin(token: string) {
  const user = await prisma.user.findUnique({
    select: {id: true, admin: true},
    where: {loginToken: token}
  });

  //no user found
  if (user === null) {
    return false;
  }

  return user.admin !== null;
}

//sending the loginToken in the POST body because it comes from middleware
const Z_REQUEST = z.object({
  loginToken: z.string(),
});
//return if single user is admin or not
export async function POST(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  if (request.loginToken === undefined) {
    return NextResponse.json({error: "No loginToken provided with request"}, {status: 400});
  }

  const isAdmin = await userIsAdmin(request.loginToken);

  return NextResponse.json({isAdmin});
}