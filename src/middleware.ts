import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";

const Z_ADMIN_RESPONSE = z.object({
  isAdmin: z.boolean()
});

const Z_EXPIRY_RESPONSE = z.object({
  expiry: z.number()
});

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value;

  //validate that the session token is still alive
  if (token) {
    let response;
    try {
      //must be an api fetch because PrismaClient cant run in vercel edge functions
      response = Z_EXPIRY_RESPONSE.parse(await (await fetch(new URL("/api/user/token", process.env.BASE_URL), {
        method: "POST",
        body: JSON.stringify({
          token: token
        }),
        mode: "cors",
        cache: "default"
      })).json());
    }
    catch(e: unknown) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  
    if (Date.now() > response.expiry.valueOf()) {
      const response = new NextResponse;
      response.cookies.delete("token");
      return response;
    }
  }

  //if user is logged in and tries to access login page
  if (path === "/login" && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // if user tries to access admin page
  if (path.startsWith("/admin")) {
    //if no token, user isnt logged in, so cant be an admin
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    let response;
    try {
      //must be an api fetch because PrismaClient cant run in vercel edge functions
      response = Z_ADMIN_RESPONSE.parse(await (await fetch(new URL("/api/admin/user", process.env.BASE_URL), {
        method: "POST",
        body: JSON.stringify({
          token: token
        }),
        mode: "cors",
        cache: "default"
      })).json());
    }
    catch(e: unknown) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (!response.isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

//will probably start using the matcher once i have many routes to check
// export const config = {
//   matcher: [
//     "/admin"
//   ]
// }