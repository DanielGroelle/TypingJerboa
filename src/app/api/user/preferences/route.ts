import { NextRequest, NextResponse } from "next/server";
import { findUserFromLoginToken } from "../../admin/user/route";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getLanguageScriptId, getLanguageScriptString } from "../../utility/utility";

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

  const newPreferences = await prisma.user.update({
    select: {languageScriptPreference: true},
    where: {id: userId},
    data: {
      languageScriptIdPreference: firstLanguageScript.id
    }
  });
  if (!newPreferences) {
    return null;
  }

  return newPreferences;
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

  if (user.languageScriptIdPreference === null) {
    const newPreferences = await initializeUserPreferences(user.id);
    if (newPreferences === null) {
      return NextResponse.json({error: "Error initializing user preferences"}, {status: 400});
    }

    return NextResponse.json({preferences: {...newPreferences}});
  }

  const languageScript = await getLanguageScriptString(user.languageScriptIdPreference);
  if (languageScript === null) {
    return NextResponse.json({error: "Could not find languageScript from id"}, {status: 400});
  }

  return NextResponse.json({preferences: {
    languageScript: {
      id: user.languageScriptIdPreference,
      languageScript: languageScript.languageScript
    }
  }});
}

const Z_REQUEST = z.object({
  languageScript: z.string()
});
//update a users preferences
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

  if (user.languageScriptIdPreference === null) {
    const initializedPreferences = await initializeUserPreferences(user.id);
    if (initializedPreferences === null) {
      return NextResponse.json({error: "Error initializing user preferences"}, {status: 400});
    }
  }

  const languageScriptId = await getLanguageScriptId(request.languageScript);
  if (languageScriptId === null) {
    return NextResponse.json({error: "Error getting languageScript id"}, {status: 400});
  }

  const updatedPreferences = await prisma.user.update({
    select: {
      languageScriptIdPreference: true
    },
    data: {
      languageScriptIdPreference: languageScriptId.id
    },
    where: {id: user.id}
  });

  if (updatedPreferences === null) {
    return NextResponse.json({error: "Error updating languageScript preference"}, {status: 400});
  }

  const response = NextResponse.json({preferences: {languageScript: {id: updatedPreferences.languageScriptIdPreference, languageScript: request.languageScript}}});
  response.cookies.set("languageScriptPreference", request.languageScript);
  return response;
}