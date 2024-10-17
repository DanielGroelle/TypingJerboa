import { NextRequest, NextResponse } from "next/server";
import { findUserFromLoginToken } from "../admin/user/route";

//fetch user
export async function GET(req: NextRequest) {
  //get the loginToken from the users cookies if it exists
  const loginToken = req.cookies.get("loginToken")?.value;
  if (loginToken === undefined) {
    return NextResponse.json({user: null});
  }

  const user = await findUserFromLoginToken(loginToken);
  if (user === null) {
    return NextResponse.json({user: null});
  }

  return NextResponse.json({user: {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt
  }});
}