import { userIsAdmin } from "@/app/api/utility/utility";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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