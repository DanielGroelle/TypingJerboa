import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findUserFromLoginToken } from "../../admin/user/route";
import { findUniqueFinishedLessons, generateRandomWord, shuffle } from "../../utility/utility";

function generateWordExerciseLessonText(
  activeLesson: string[],
  learnedChars: string[],
  fetchedWords: {word: string}[],
  wordsByChar: {[activeChar: string]: string[]},
  letterRegex: RegExp,
  numberRegex: RegExp
) {
  //find any symbols in the activeLesson
  const symbolActiveChars = activeLesson.filter(activeChar => !(letterRegex.test(activeChar) || numberRegex.test(activeChar)));

  //filter the fetched words to only include words that contain a character from the activeLesson, and the rest from previous completed lessons
  const completeCharset = new Set([...learnedChars, ...activeLesson]);
  for (const activeChar of activeLesson) {
    //if the char is a char, make sure its present in the word
    if (letterRegex.test(activeChar)) {
      wordsByChar[activeChar] = fetchedWords.map(wordObj => wordObj.word).filter(word => {
        const wordChars = [...word];
        return wordChars.some(char => activeChar === char) && wordChars.every(char => completeCharset.has(char));
      });
    }
    //get all valid words in the case of numbers
    else if(numberRegex.test(activeChar)) {
      wordsByChar[activeChar] = fetchedWords.map(wordObj => wordObj.word).filter(word => {
        const wordChars = [...word];
        return wordChars.every(char => completeCharset.has(char));
      });
    }
    //place random non chars around valid words
    else {
      const chanceForEmpty = .5;
      wordsByChar[activeChar] = fetchedWords.map(wordObj => {
        const randomPrefix = Math.random() > chanceForEmpty ? symbolActiveChars[Math.floor(Math.random() * symbolActiveChars.length)] : "";
        const randomSuffix = Math.random() > chanceForEmpty ? symbolActiveChars[Math.floor(Math.random() * symbolActiveChars.length)] : "";
        return `${randomPrefix}${wordObj.word}${randomSuffix}`;
      }).filter(word => {
        const wordChars = [...word];
        return wordChars.some(char => activeChar === char) && wordChars.every(char => completeCharset.has(char));
      });
    }
  }
}

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

  const tryRequest = Z_REQUEST.safeParse(await req.json());
  if (!tryRequest.success) {
    console.log(tryRequest.error);
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }
  const request = tryRequest.data;

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

  const wordsByChar: {[activeChar: string]: string[]} = {}; //words grouped by char in the active lesson
  for(const activeChar of request.activeLesson) {
    wordsByChar[activeChar] = [];
  }

  //regex to check if the character is a letter or number in unicode
  const letterRegex = /\p{L}/u;
  const numberRegex = /\p{Nd}/u;
  const numberActiveChars = request.activeLesson.filter(activeChar => numberRegex.test(activeChar));

  //only fetch words to use in lesson text if the mode selected is word-exercise
  if (request.mode === "word-exercise") {
    let learnedChars = [] as string[];

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

    //mutates wordsByChar in place for later use
    generateWordExerciseLessonText(request.activeLesson, learnedChars, fetchedWords, wordsByChar, letterRegex, numberRegex);
  }

  const wordLimit = 15;
  const minimumLength = 3;
  const lengthRange = 3;
  const wordsPerChar = Math.ceil(wordLimit / request.activeLesson.length);

  for (const activeChar of Object.keys(wordsByChar)) {
    //if activeChar is a number, generate random numbers around words
    if (numberRegex.test(activeChar)) {
      wordsByChar[activeChar] = wordsByChar[activeChar].map(word =>{
        const length = Math.floor((Math.random() * lengthRange) + (minimumLength - 1));
        const generatedWord = generateRandomWord(numberActiveChars, activeChar, length);
        return `${word} ${generatedWord}`;
      });
    }
    
    //TODO: repeat some words if not long enough
    
    const wordsForChar = wordsByChar[activeChar];
    
    //if the words array for a char is less than wordsPerChar, generate new "words" with random characters
    while (wordsForChar.length < wordsPerChar) {
      const length = Math.floor((Math.random() * lengthRange) + minimumLength);
      wordsForChar.push(generateRandomWord(request.activeLesson, activeChar, length));
    }
    shuffle(wordsForChar);
    wordsByChar[activeChar] = wordsForChar.slice(0, wordsPerChar);
  }

  const words = Object.values(wordsByChar).flatMap(charWord => charWord);

  shuffle(words);
  //limit the words to wordLimit and join them into one string
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

  return new NextResponse(JSON.stringify({startTime, lessonText, lessonId: createResult.id}));
}