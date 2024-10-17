import { NextRequest, NextResponse } from "next/server";
import { findUserFromLoginToken } from "../../admin/user/route";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getLanguageScriptId } from "../../utility/utility";

//if no preferences assigned yet for userId, initialize languageScript to first in db
async function initializeUserPreferences(userId: number) {
  const firstLanguageScript = await prisma.languageScript.findFirst({
    select: {
      id: true,
      languageScript: true
    },
    orderBy: {id: "asc"}
  });
  if (firstLanguageScript === null) {
    return null;
  }

  const newPreferences = await prisma.preference.create({
    select: {
      languageScript: true
    },
    data: {
      id: userId,
      languageScriptId: firstLanguageScript.id
    }
  });

  return newPreferences;
}

async function getPreferences(userId: number) {
  const preferences = await prisma.preference.findFirst({
    select: {
      languageScript: true
    },
    where: {
      user: {id: userId}
    }
  });

  return preferences;
}

//fetch user preferences
export async function GET(req: NextRequest) {
  //get the loginToken from the users cookies if it exists
  const loginToken = req.cookies.get("loginToken")?.value;
  if (loginToken === undefined) return NextResponse.json({error: "No loginToken provided"}, {status: 400});

  const user = await findUserFromLoginToken(loginToken);
  if (user === null) {
    return NextResponse.json({error: "User not found from login token"}, {status: 400});
  }

  const preferences = await getPreferences(user.id);
  if (preferences === null) {
    const newPreferences = await initializeUserPreferences(user.id);
    if (newPreferences === null) {
      return NextResponse.json({error: "Error initializing user preferences"}, {status: 400});
    }

    return NextResponse.json({preferences: {...newPreferences}});
  }

  return NextResponse.json({preferences});
}

const Z_REQUEST = z.object({
  languageScript: z.string()
})
//associate races set under a session to be under a user
export async function POST(req: NextRequest) {
  //get the loginToken from the users cookies if it exists
  const loginToken = req.cookies.get("loginToken")?.value;

  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  const user = await findUserFromLoginToken(loginToken);
  if (user === null) {
    return NextResponse.json({error: "User not found from login token"}, {status: 400});
  }

  const preferences = await getPreferences(user.id);
  if (preferences === null) {
    const initializedPreferences = await initializeUserPreferences(user.id);
    if (initializedPreferences === null) {
      return NextResponse.json({error: "Error initializing user preferences"}, {status: 400});
    }
  }

  const languageScriptId = await getLanguageScriptId(request.languageScript);
  if (languageScriptId === null) {
    return NextResponse.json({error: "Error getting languageScript id"}, {status: 400});
  }

  const updatedPreferences = await prisma.preference.update({
    select: {
      languageScript: true
    },
    data: {
      languageScriptId: languageScriptId.id
    },
    where: {id: user.id}
  });

  return NextResponse.json({preferences: {...updatedPreferences}});
}