import prisma from "@/lib/prisma";
import {NextRequest} from "next/server";
import {z} from "zod";

export async function GET(req: NextRequest) {

  return new Response();
}

const Z_REQUEST = z.object({
  languageScriptId: z.number()
});

export async function POST(req: NextRequest) {
  const request = Z_REQUEST.safeParse(await req.json());

  if (!request.success) {
    return new Response("Request was structured incorrectly", {status: 400})
  }

  //5 second countdown before start
  const startTime = new Date(Date.now() + 5000);

  //fetch the number of paragraphs for a given languageScript
  const languageScriptResult = await prisma.paragraph.findFirst({
    select: {
      languageScriptIndex: true
    },
    where: {
      languageScript: {
        id: request.data.languageScriptId
      }
    },
    orderBy: {
      languageScriptIndex: "desc"
    }
  });

  if (languageScriptResult === null) {
    return new Response("LanguageScriptId not found", {status: 400});
  }

  const lastParagraphIndex = languageScriptResult.languageScriptIndex;
  const chosenParagraphIndex = Math.floor(Math.random() * (lastParagraphIndex + 1));

  //fetch the paragraph id
  const chosenParagraphIdResult = await prisma.paragraph.findFirst({
    select: {
      id: true
    },
    where: {
      languageScriptIndex: chosenParagraphIndex
    }
  });

  if (chosenParagraphIdResult === null) {
    return new Response("Paragraph id not found", {status: 400});
  }

  const chosenParagraphId = chosenParagraphIdResult.id

  const createResult = await prisma.race.create({
    data: {
      startTime: startTime,
      paragraphId: chosenParagraphId
      //TODO: implement session tokens
    }
  });

  if (createResult === null) {
    return new Response("Race creation failed", {status: 400});
  }

  return new Response(JSON.stringify({startTime}));
}