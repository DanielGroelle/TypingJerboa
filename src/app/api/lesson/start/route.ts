import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findUniqueFinishedLessons, findUserFromLoginToken, generateRandomWord, getLanguageScriptId, shuffle } from "../../utility/utility";

//generates the lesson text when the selected mode is word-exercise
function generateWordExerciseLessonText(
  activeLesson: string[],
  learnedChars: Set<string>,
  fetchedWords: {word: string}[],
  wordsByChar: {[activeChar: string]: string[]},
  letterRegex: RegExp,
  numberRegex: RegExp
) {
  const wordCapitalizedVariants = fetchedWords.flatMap(wordObj => [wordObj.word, wordObj.word.toUpperCase(), `${wordObj.word.toUpperCase()[0]}${wordObj.word.slice(1)}`]);

  //find any symbols in the activeLesson
  const symbolActiveChars = activeLesson.filter(activeChar => !(letterRegex.test(activeChar) || numberRegex.test(activeChar)));
  const completeCharset = new Set([...learnedChars, ...activeLesson]);

  //filter the fetched words to only include words that contain a character from the activeLesson, and the rest from previous completed lessons
  for (const activeChar of activeLesson) {
    if (letterRegex.test(activeChar)) {
      wordsByChar[activeChar] = wordCapitalizedVariants.filter(word => {
        const wordChars = [...word];
        //if the activeChar is a letter, make sure the letter is present in the word
        return wordChars.some(char => activeChar === char) && wordChars.every(char => completeCharset.has(char));
      });
      continue;
    }
    
    //return all valid words when activeChar is a number
    if(numberRegex.test(activeChar)) {
      wordsByChar[activeChar] = wordCapitalizedVariants.filter(word => {
        const wordChars = [...word];
        return wordChars.every(char => completeCharset.has(char));
      });
      continue;
    }

    //when activeChar is a symbol, place the symbols randomly around valid words
    const chanceForEmpty = .5;
    wordsByChar[activeChar] = wordCapitalizedVariants.map(word => {
      //place random prefix and suffixes to valid words
      const randomPrefix = Math.random() > chanceForEmpty ? symbolActiveChars[Math.floor(Math.random() * symbolActiveChars.length)] : "";
      const randomSuffix = Math.random() > chanceForEmpty ? symbolActiveChars[Math.floor(Math.random() * symbolActiveChars.length)] : "";
      return `${randomPrefix}${word}${randomSuffix}`;
    }).filter(word => {
      const wordChars = [...word];
      return wordChars.some(char => activeChar === char) && wordChars.every(char => completeCharset.has(char));
    });
  }
}

//TODO: make a word length limit to prevent unreasonably long words from being given to user

const Z_REQUEST = z.object({
  activeLesson: z.array(z.string()),
  languageScript: z.string(),
  mode: z.union([
    z.literal("new-characters"),
    z.literal("word-exercise")
  ])
});
//start lesson and get lessonText and startTime
export async function POST(req: NextRequest) {
  //get the login/sessionToken from the users cookies if it exists
  const loginToken = req.cookies.get("loginToken")?.value;
  const sessionToken = req.cookies.get("sessionToken")?.value;

  const tryRequest = Z_REQUEST.safeParse(await req.json());
  if (!tryRequest.success) {
    console.error(tryRequest.error);
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }
  const request = tryRequest.data;

  const startTime = new Date();
  const user = await findUserFromLoginToken(loginToken);
  const languageScriptId = await getLanguageScriptId(request.languageScript)
  if (languageScriptId === null) {
    return NextResponse.json({error: "LanguageScript not found"}, {status: 400});
  }

  const wordsByChar: {[activeChar: string]: string[]} = {}; //words grouped by char in the active lesson
  //initialize to empty arrays in case the mode is not word-exercise
  for(const activeChar of request.activeLesson) {
    wordsByChar[activeChar] = [];
  }

  //regex to check if the character is a letter or number in unicode
  const letterRegex = /\p{L}/u;
  const numberRegex = /\p{Nd}/u;
  const numberActiveChars = request.activeLesson.filter(activeChar => numberRegex.test(activeChar));
  
  if (request.mode === "word-exercise") {
    let learnedChars = new Set([]) as Set<string>;
    
    // find all the lessons user has done and add the characters from those lessons in both modes to the learnedChars set
    const finishedLessons = await findUniqueFinishedLessons({userId: user?.id, sessionToken: sessionToken});

    if (finishedLessons) {
      const newCharacterLearnedChars = finishedLessons[request.languageScript].newCharacters.reduce((accumulator, lesson)=>{
        return accumulator.concat([...lesson.split("")]);
      }, [] as string[]);
      const wordExerciseLearnedChars = finishedLessons[request.languageScript].wordExercise.reduce((accumulator, lesson)=>{
        return accumulator.concat([...lesson.split("")]);
      }, [] as string[]);
      learnedChars = new Set([...newCharacterLearnedChars, ...wordExerciseLearnedChars]);
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
    
    let wordsForChar = wordsByChar[activeChar];
    //duplicate each word if not enough words
    if (wordsForChar.length < wordsPerChar) {
      wordsForChar = [...wordsForChar, ...wordsForChar];
    }

    //if still not enough words, as a last resort generate new "words" with random characters
    while (wordsForChar.length < wordsPerChar) {
      const length = Math.floor((Math.random() * lengthRange) + minimumLength);
      wordsForChar.push(generateRandomWord(request.activeLesson, activeChar, length));
    }

    //shuffle words, since only first several words are returned after slicing
    shuffle(wordsForChar);
    wordsByChar[activeChar] = wordsForChar.slice(0, wordsPerChar);
  }

  const words = Object.values(wordsByChar).flatMap(charWord => charWord);
  shuffle(words); //final shuffle for lesson

  //limit the words to wordLimit and join them into one string for lessonText
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