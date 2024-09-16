import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findUserFromLoginToken } from "../../admin/user/route";
import { findUniqueFinishedLessons, generateRandomWord, shuffle } from "../../utility/utility";

const Z_REQUEST = z.object({
  activeLesson: z.array(z.string()),
  languageScript: z.string(),
  mode: z.string()
});
//start lesson and get lessonText and startTime
export async function POST(req: NextRequest) {
  //get the login/sessionToken from the users cookies if it exists
  const loginToken = req.cookies.get("loginToken")?.value;
  const sessionToken = req.cookies.get("sessionToken")?.value;

  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  if (request.activeLesson === null) {
    return NextResponse.json({error: "No lesson chosen"}, {status: 400});
  }

  const startTime = new Date();

  //get languageScriptId from languageScript
  const languageScriptId = await prisma.languageScript.findFirst({
    select: {id: true},
    where: {languageScript: request.languageScript}
  });
  if (languageScriptId === null) {
    return NextResponse.json({error: "LanguageScript not found"}, {status: 400});
  }

  const user = await findUserFromLoginToken(loginToken);

  // find all the lessons user has done and add the characters from those lessons to the learnedChars array
  let learnedChars = [] as string[];
  const finishedLessons = await findUniqueFinishedLessons({userId: user?.id, sessionToken: sessionToken});
  if (finishedLessons) learnedChars = finishedLessons.reduce((accumulator, lesson)=>{
    return accumulator.concat([...lesson.lessonCharacters.split("")])
  }, [] as string[]);

  const fetchedWords = await prisma.word.findMany({
    select: {
      word: true
    },
    where: {
      languageScriptId: languageScriptId.id
    }
  });

  //filter the fetched words to only include words that contain a character from the activeLesson, and the rest from previous completed lessons
  const activeCharset = new Set([...request.activeLesson]);
  const completeCharset = new Set([...learnedChars, ...request.activeLesson]);
  const filteredWords = fetchedWords.map((wordObj)=>wordObj.word).filter((word)=>{
    const wordChars = [...word];
    return wordChars.some(char => activeCharset.has(char)) && wordChars.every(char => completeCharset.has(char));
  });

  //if the filtered words is less than minWords, generate new "words" with random characters
  const minWords = 10;
  const minimumLength = 3;
  const lengthRange = 3;
  while (filteredWords.length < minWords) {
    const length = Math.floor((Math.random() * lengthRange) + minimumLength);
    filteredWords.push(generateRandomWord(request.activeLesson, length));
  }

  shuffle(filteredWords);
  const lessonText = filteredWords.slice(0, minWords).join(" ");

  const createResult = await prisma.lesson.create({
    select: {
      id: true
    },
    data: {
      startTime: startTime,
      languageScriptId: languageScriptId.id,
      lessonCharacters: request.activeLesson.join(""),
      lessonText: lessonText,
      mode: request.mode,
      userId: user?.id,
      sessionToken: sessionToken ?? null
    }
  });

  if (createResult === null) {
    return NextResponse.json({error: "Lesson creation failed"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({startTime, lessonText: lessonText, lessonId: createResult.id}));
}