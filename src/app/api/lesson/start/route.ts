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

  const wordsByLetter: {[activeChar: string]: string[]} = {}; //words grouped by letter in the active lesson

  //only fetch words to use in lesson text if the mode selected is word exercise
  if (request.mode === "word-exercise") {
    let learnedChars = [] as string[];

    //TODO: if the activeLesson is on numbers, intersperse generated numbers between words

    // find all the lessons user has done and add the characters from those lessons to the learnedChars array
    const finishedLessons = await findUniqueFinishedLessons({userId: user?.id, sessionToken: sessionToken});
    if (finishedLessons) {
      learnedChars = finishedLessons.reduce((accumulator, lesson)=>{
        return accumulator.concat([...lesson.lessonCharacters.split("")]);
      }, [] as string[]);
    }

    const fetchedWords = await prisma.word.findMany({
      select: {
        word: true
      },
      where: {
        languageScriptId: languageScriptId.id
      }
    });

    //regex to check if the character is a letter in unicode
    const letterRegex = /\p{L}/gu;
    const nonLetterActiveChars = request.activeLesson.filter(activeChar => !letterRegex.test(activeChar));

    //filter the fetched words to only include words that contain a character from the activeLesson, and the rest from previous completed lessons
    const completeCharset = new Set([...learnedChars, ...request.activeLesson]);
    for (const activeChar of request.activeLesson) {
      //if the char is a letter, make sure its present in the word
      if (letterRegex.test(activeChar)) {
        wordsByLetter[activeChar] = fetchedWords.map(wordObj => wordObj.word).filter(word => {
          const wordChars = [...word];
          return wordChars.some(char => activeChar === char) && wordChars.every(char => completeCharset.has(char));
        });
      }
      //place random non letters around valid words
      else {
        const chanceForEmpty = .5;
        wordsByLetter[activeChar] = fetchedWords.map(wordObj => {
          const randomPrefix = Math.random() > chanceForEmpty ? nonLetterActiveChars[Math.floor(Math.random() * nonLetterActiveChars.length)] : "";
          const randomSuffix = Math.random() > chanceForEmpty ? nonLetterActiveChars[Math.floor(Math.random() * nonLetterActiveChars.length)] : "";
          return `${randomPrefix}${wordObj.word}${randomSuffix}`;
        }).filter(word => {
          const wordChars = [...word];
          return wordChars.some(char => activeChar === char) && wordChars.every(char => completeCharset.has(char));
        });
      }
    }
  }

  const wordLimit = 15;
  const minimumLength = 3;
  const lengthRange = 3;
  const wordsPerLetter = Math.ceil(wordLimit / request.activeLesson.length);
  for (const [activeChar, letterWords] of Object.entries(wordsByLetter)) {
    //TODO: repeat some words if not long enough
    //if the words array is less than wordLimit, generate new "words" with random characters
    while (letterWords.length < wordsPerLetter) {
      const length = Math.floor((Math.random() * lengthRange) + minimumLength);
      letterWords.push(generateRandomWord(request.activeLesson, length));
    }
    shuffle(letterWords);
    wordsByLetter[activeChar] = letterWords.slice(0, wordsPerLetter);
  }

  const words = Object.values(wordsByLetter).flatMap(letterWord => letterWord);

  shuffle(words);
  //limit the words to wordLimit and join them into a one string
  const lessonText = words.slice(0, wordLimit).join(" ");

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