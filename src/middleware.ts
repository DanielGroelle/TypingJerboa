import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";

const Z_ADMIN_RESPONSE = z.object({
  isAdmin: z.boolean()
});

const Z_EXPIRY_RESPONSE = z.object({
  expiry: z.number()
});

const Z_TOKEN_RESPONSE = z.object({
  token: z.string(),
  expiry: z.string()
});

async function createNewSession(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  const newSession = createId();
  response.cookies.set("sessionToken", newSession);

  try {
    //must be an api fetch because PrismaClient cant run in vercel edge functions
    Z_TOKEN_RESPONSE.parse(await (await fetch(new URL("/api/user/session-token/create", process.env.BASE_URL), {
      method: "POST",
      body: JSON.stringify({
        sessionToken: newSession
      }),
      mode: "cors",
      cache: "default"
    })).json());
  }
  catch(e: unknown) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const loginToken = request.cookies.get("loginToken")?.value;
  const sessionToken = request.cookies.get("sessionToken")?.value;

  //validate that the loginToken is still alive
  if (loginToken) {
    let response;
    try {
      //must be an api fetch because PrismaClient cant run in vercel edge functions
      response = Z_EXPIRY_RESPONSE.parse(await (await fetch(new URL("/api/user/login-token", process.env.BASE_URL), {
        method: "POST",
        body: JSON.stringify({
          loginToken: loginToken
        }),
        mode: "cors",
        cache: "default"
      })).json());
    }
    catch(e: unknown) {
      //if theres an error its probably because the loginToken doesnt exist so just delete it from the users cookies
      const errorResponse = NextResponse.redirect(new URL("/", request.url));
      errorResponse.cookies.delete("loginToken");
      return errorResponse;
    }
  
    //if the loginToken has expired, delete it from the users cookies
    if (Date.now() > response.expiry.valueOf()) {
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("loginToken");
      //delete login from login table
      try {
        //must be an api fetch because PrismaClient cant run in vercel edge functions
        Z_TOKEN_RESPONSE.parse(await (await fetch(new URL("/api/user/login-token", process.env.BASE_URL), {
          method: "DELETE",
          body: JSON.stringify({
            loginToken: loginToken
          }),
          mode: "cors",
          cache: "default"
        })).json());
      }
      catch(e: unknown) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      return response;
    }

    //remove sessionToken from users cookies if logged in
    if (sessionToken) {
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("sessionToken");

      //change races set under a session to be associated with a user
      try {
        await (await fetch(new URL("/api/user/races", process.env.BASE_URL), {
          method: "POST",
          body: JSON.stringify({
            loginToken: loginToken,
            sessionToken: sessionToken
          }),
          mode: "cors",
          cache: "default"
        })).json();
      }
      catch(e: unknown) {
        console.error(e);
      }

      return response;
    }
  }

  //if user is logged in and tries to access login page
  if (path === "/login" && loginToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // if user tries to access admin page
  if (path.startsWith("/admin")) {
    //if no loginToken, user isnt logged in, so cant be an admin
    if (!loginToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    let response;
    try {
      //must be an api fetch because PrismaClient cant run in vercel edge functions
      response = Z_ADMIN_RESPONSE.parse(await (await fetch(new URL("/api/admin/user", process.env.BASE_URL), {
        method: "POST",
        body: JSON.stringify({
          loginToken: loginToken
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

  //validate that the sessionToken is still alive
  if (sessionToken) {
    let response;
    try {
      //must be an api fetch because PrismaClient cant run in vercel edge functions
      response = Z_EXPIRY_RESPONSE.parse(await (await fetch(new URL("/api/user/session-token", process.env.BASE_URL), {
        method: "POST",
        body: JSON.stringify({
          sessionToken: sessionToken
        }),
        mode: "cors",
        cache: "default"
      })).json());
    }
    catch(e: unknown) {
      //if theres an error its probably because the sessionToken doesnt exist so just delete it from the users cookies
      const errorResponse = NextResponse.redirect(new URL("/", request.url));
      errorResponse.cookies.delete("sessionToken");
      return errorResponse;
    }

    //if the sessionToken has expired, set a new one
    if (Date.now() > response.expiry.valueOf()) {
      return await createNewSession(request);
    }
  }

  if (!loginToken && !sessionToken) {
    return await createNewSession(request);
  }

  return NextResponse.next();
}

//will probably start using the matcher once i have many routes to check
// export const config = {
//   matcher: [
//     "/admin"
//   ]
// }