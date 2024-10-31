import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";

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
  let zodResponse;
  try {
    //must be an api fetch because PrismaClient cant run in vercel edge functions
    zodResponse = Z_TOKEN_RESPONSE.parse(await (await fetch(new URL("/api/user/session-token/create", process.env.BASE_URL), {
      method: "GET",
      mode: "cors",
      cache: "default"
    })).json());
  }
  catch(e: unknown) {
    console.log("Create New Session", e);
    return NextResponse.redirect(new URL("/", request.url));
  }
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set("sessionToken", zodResponse.token, {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
    expires: new Date(zodResponse.expiry)
  });
  
  return response;
}

async function validateLoginToken(request: NextRequest, loginToken: string) {
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
      console.log("loginToken expiry", e);
      return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  }
}

async function validateSessionToken(request: NextRequest, sessionToken: string) {
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
    console.log("check sessionToken alive", e)
    const errorResponse = NextResponse.redirect(new URL("/", request.url));
    errorResponse.cookies.delete("sessionToken");
    return errorResponse;
  }

  //if the sessionToken has expired, set a new one
  if (Date.now() > response.expiry.valueOf()) {
    return await createNewSession(request);
  }
}

async function moveSessionDataToUser(request: NextRequest, sessionToken: string, loginToken: string) {
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
    console.error("remove sessionToken from races error", e);
  }

  //change lessons set under a session to be associated with a user
  try {
    await (await fetch(new URL("/api/user/lessons", process.env.BASE_URL), {
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
    console.error("remove sessionToken from lessons error", e);
  }

  return response;
}

async function checkUserIsAdmin(loginToken: string) {
  let response;
  try {
    //must be an api fetch because PrismaClient cant run in vercel edge functions
    response = Z_ADMIN_RESPONSE.parse(await (await fetch(new URL("/api/admin/user/is-admin", process.env.BASE_URL), {
      method: "POST",
      body: JSON.stringify({
        loginToken: loginToken
      }),
      mode: "cors",
      cache: "default"
    })).json());
  }
  catch(e: unknown) {
    console.log("admin api error", e);
    return NextResponse.json({error: "Unknown api error"}, {status: 400});
  }

  if (!response.isAdmin) {
    return NextResponse.json({error: "Not authorized for this action"}, {status: 403});
  }

  return NextResponse.next();
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const loginToken = request.cookies.get("loginToken")?.value;
  const sessionToken = request.cookies.get("sessionToken")?.value;

  //if the path is /api/, could be an internal request. this check prevents infinite redirects
  if (path.startsWith("/api/")) {
    if (path.startsWith("/api/admin") && path !== "/api/admin/user/is-admin") {
      //no loginToken so cant be authorized
      if (!loginToken) {
        return NextResponse.json({error: "Not authorized for this action"}, {status: 403});
      }

      await checkUserIsAdmin(loginToken);
    }

    return NextResponse.next();
  }

  //validate that the loginToken is still alive
  if (loginToken) {
    const response = await validateLoginToken(request, loginToken);
    if (response !== undefined) return response;

    //remove sessionToken from users cookies if logged in
    if (sessionToken) {
      return await moveSessionDataToUser(request, sessionToken, loginToken);
    }
  }  

  //validate that the sessionToken is still alive
  if (sessionToken) {
    const response = await validateSessionToken(request, sessionToken);
    if (response !== undefined) return response;
  }

  //generate a new sessionToken if no loginToken or sessionToken
  if (!loginToken && !sessionToken) {
    return await createNewSession(request);
  }
  
  //if user is logged in and tries to access login page
  if (path.startsWith("/login") && loginToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  //if user not logged in and tries to access account page
  if (path.startsWith("/account") && !loginToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  //if user tries to access admin page
  if (path.startsWith("/admin")) {
    //if no loginToken, user isnt logged in, so cant be an admin
    if (!loginToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    let response;
    try {
      //must be an api fetch because PrismaClient cant run in vercel edge functions
      response = Z_ADMIN_RESPONSE.parse(await (await fetch(new URL("/api/admin/user/is-admin", process.env.BASE_URL), {
        method: "POST",
        body: JSON.stringify({
          loginToken: loginToken
        }),
        mode: "cors",
        cache: "default"
      })).json());
    }
    catch(e: unknown) {
      console.log("admin error", e);
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (!response.isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  //everything passes, so continue serving user
  return NextResponse.next();
}