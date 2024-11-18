import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";

//Abandon all hope, ye who enter here

//TODO: if this ever happens, make all of this sensible
//https://github.com/vercel/next.js/discussions/71727

const Z_ADMIN_RESPONSE = z.object({
  isAdmin: z.boolean()
});

const Z_TOKEN_RESPONSE = z.object({
  token: z.string(),
  expiry: z.string()
});
async function createNewSession(request: NextRequest) {
  let zodResponse;
  try {
    //must be an api fetch because PrismaClient cant run in vercel edge functions
    zodResponse = Z_TOKEN_RESPONSE.parse(await (await fetch(new URL("/api/admin/user/session-token/create", process.env.BASE_URL), {
      method: "POST",
      body: JSON.stringify({secret: process.env.TOKEN_SECRET}),
      mode: "cors",
      cache: "default"
    })).json());
  }
  catch(e: unknown) {
    console.error("createNewSession error", e);
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.next();
  response.cookies.set("sessionToken", zodResponse.token, {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
    expires: new Date(zodResponse.expiry)
  });
  
  return response;
}

const Z_EXPIRY_RESPONSE = z.object({
  expiry: z.number()
});
async function validateLoginToken(request: NextRequest, loginToken: string) {
  let response;
  try {
    //must be an api fetch because PrismaClient cant run in vercel edge functions
    response = Z_EXPIRY_RESPONSE.parse(await (await fetch(new URL("/api/admin/user/login-token", process.env.BASE_URL), {
      method: "POST",
      body: JSON.stringify({
        loginToken: loginToken,
        secret: process.env.TOKEN_SECRET
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
      Z_TOKEN_RESPONSE.parse(await (await fetch(new URL("/api/admin/user/login-token", process.env.BASE_URL), {
        method: "DELETE",
        body: JSON.stringify({
          loginToken: loginToken,
          secret: process.env.TOKEN_SECRET
        }),
        mode: "cors",
        cache: "default"
      })).json());
    }
    catch(e: unknown) {
      console.error("loginToken expiry error", e);
      return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  }
}

async function validateSessionToken(request: NextRequest, sessionToken: string) {
  let response;
  try {
    //must be an api fetch because PrismaClient cant run in vercel edge functions
    response = Z_EXPIRY_RESPONSE.parse(await (await fetch(new URL("/api/admin/user/session-token", process.env.BASE_URL), {
      method: "POST",
      body: JSON.stringify({
        sessionToken: sessionToken,
        secret: process.env.TOKEN_SECRET
      }),
      mode: "cors",
      cache: "default"
    })).json());
  }
  catch(e: unknown) {
    //if theres an error its probably because the sessionToken doesnt exist so just delete it from the users cookies
    console.error("Validate sessionToken error", e)
    const errorResponse = NextResponse.redirect(new URL("/", request.url));
    errorResponse.cookies.delete("sessionToken");
    return errorResponse;
  }

  //if the sessionToken has expired, set a new one
  if (Date.now() > response.expiry.valueOf()) {
    return await createNewSession(request);
  }
}

async function addToVisitorTable(ip: string) {
  try {
    await (await fetch(new URL("/api/admin/visitors", process.env.BASE_URL), {
      method: "POST",
      body: JSON.stringify({
        secret: process.env.TOKEN_SECRET,
        ip
      }),
      mode: "cors",
      cache: "default"
    })).json();
  }
  catch(e: unknown) {
    console.error("Add to visitor table error", e);
  }
}

const Z_PREFERENCE_RESPONSE = z.object({
  preferences: z.object({
    languageScript: z.object({
      id: z.number(),
      languageScript: z.string()
    })
  })
});
async function getUserPreferences(loginToken: string) {
  const tryResponse = Z_PREFERENCE_RESPONSE.safeParse(await (await fetch(new URL("/api/user/preferences", process.env.BASE_URL), {
    headers: {
      Cookie: `loginToken=${loginToken}`,
    },
    credentials: "include",
    method: "GET",
    mode: "cors",
    cache: "default"
  })).json());
  
  if (!tryResponse.success) {
    return NextResponse.json({error: "Failed to receive preferences"}, {status: 500});
  }

  const response = NextResponse.next();
  response.cookies.set("languageScriptPreference", tryResponse.data.preferences.languageScript.languageScript, {
    secure: true,
    httpOnly: true,
    sameSite: "strict"
  });
  return response;
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
    console.error("Remove sessionToken from lessons error", e);
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
    console.error("Admin api error", e);
    return NextResponse.json({error: "Unknown api error"}, {status: 500});
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
  const preferences = request.cookies.get("languageScriptPreference")?.value;

  //if not an internal /api/ request, and not logged in user, add ip to visitor table
  if (!path.startsWith("/api/") && !loginToken) {
    const forwardedIp = request.headers.get('x-forwarded-for');
    //these are alternatives that might work but also might not
    // const realIp = request.headers.get('x-real-ip');
    // const geo = request.geo;
    // const ipAddress = request.ip;
    if (forwardedIp) {
      await addToVisitorTable(forwardedIp);
    }
  }

  //if the path is /api/, could be an internal request. this check prevents infinite redirects
  if (path.startsWith("/api/")) {
    //allow internal requests being made to login-token or session-token api routes
    //these routes check if the token secret sent in the body is correct
    if (path === "/api/admin/user/login-token" ||
      path === "/api/admin/user/session-token" ||
      path === "/api/admin/user/session-token/create" ||
      path === "/api/admin/visitors"
    ) {
      return NextResponse.next();
    }

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
      console.error("Access admin page error", e);
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (!response.isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  //fetch and assign user preferences to cookie
  if (loginToken && !preferences) {
    return await getUserPreferences(loginToken);
  }

  //everything passes, so continue serving user
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Apply middleware to all pages except * /_next/* (exclude Next.js assets, e.g., /_next/static/*)
     */
    "/((?!_next/static|_next/image).*)",
  ]
};