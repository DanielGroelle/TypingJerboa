import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const loginToken = req.cookies.get("loginToken")?.value;
  if (loginToken === undefined) {
    return NextResponse.json({message: "No login token found"}, {status: 400});
  }

  const updatedUser = await prisma?.user.update({
    where: {loginToken: loginToken},
    data: {
      loginToken: null,
      loginExpiry: null
    }
  });

  if (updatedUser === undefined) {
    return NextResponse.json({message: "Login token not valid"}, {status: 400});
  }

  const response = new NextResponse();
  response.cookies.delete("loginToken");
  return response;
}