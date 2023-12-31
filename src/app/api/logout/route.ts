import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  if (!req.cookies.has("token")) {
    return NextResponse.json({message: "No token found"}, {status: 400});
  }

  //TODO: delete associated session token from db
  
  const response = new NextResponse();
  response.cookies.delete("token");
  return response;
}