import { NextRequest, NextResponse } from "next/server";
import { findUserFromLoginToken } from "../admin/user/route";
import { findUniqueFinishedLessons } from "../utility/utility";

//fetch and return completed lessons by loginToken or sessionToken
export async function GET(req: NextRequest) {
  //get the login/sessionToken from the users cookies if it exists
  const loginToken = req.cookies.get("loginToken")?.value;
  const sessionToken = req.cookies.get("sessionToken")?.value;

  const user = await findUserFromLoginToken(loginToken);

  const finishedLessons = await findUniqueFinishedLessons({userId: user?.id, sessionToken: sessionToken});

  if (finishedLessons === undefined) {
    return new NextResponse(JSON.stringify({finishedLessons: {newCharacters: [], wordExercise: []}}));
  }

  return new NextResponse(JSON.stringify({finishedLessons}));
}