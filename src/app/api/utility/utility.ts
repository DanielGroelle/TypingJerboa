import { LanguageScripts } from "@/js/language-scripts";
import prisma from "@/lib/prisma";

//convert a language script to its corresponding id
export async function getLanguageScriptId(languageScript: string) {
  return await prisma.languageScript.findFirst({
    select: {id: true},
    where: {languageScript}
  });
}

//convert a language script id to its corresponding string name
export async function getLanguageScriptString(languageScriptId: number) {
  return await prisma.languageScript.findFirst({
    select: {languageScript: true},
    where: {id: languageScriptId}
  });
}

//pick a random paragraph based on language script id
export async function selectRandomParagraph(languageScriptId: number) {
  const randomParagraph: object[] = await prisma.$queryRaw`SELECT * FROM Paragraphs WHERE Language_script_id = ${languageScriptId} AND selectable = true OFFSET floor(random() * (SELECT COUNT(*) FROM Paragraphs WHERE Language_script_id = ${languageScriptId} and selectable = true)) LIMIT 1`;
  
  //can be undefined
  return randomParagraph[0];
}

export function extractWordsFromTexts(texts: string[]) {
  const words: string[] = [];
  for(const text of texts) {
    //match all words in the text (any unicode characters with the property of "letter")
    const possibleWords = text.match(/\p{L}+/gu);
    if (possibleWords === null) continue;
    words.push(...possibleWords);
  }

  return words;
}

export async function insertToWordTable(words: string[], languageScriptId: number) {
  const newWords: {word: string, languageScriptId: number}[] = [];
  //format words to be createMany'd
  words.forEach(word => {
    if (word.length > 0 && !word.includes("-") && !word.includes(" ")) {
      //all words must be lowercased
      newWords.push({word: word.toLowerCase(), languageScriptId});
    }
  });

  const wordInsertCount = await prisma.word.createMany({
    data: newWords,
    skipDuplicates: true
  });

  return wordInsertCount;
}

export function generateRandomWord(chars: string[], activeChar: string, length: number) {
  let word = "";
  let validWord = false;
  //generate words until word includes activeChar
  while (!validWord) {
    //set word to empty on each loop
    word = "";
    for (let i = 0; i < length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      //make sure the same character isnt chosen more than maxRepeats
      if (char === word[word.length - 1] && char === word[word.length - 2]) {
        i--;
        continue;
      }
  
      word += char;
    }

    const wordChars = [...word];
    //check the word contains the active char
    validWord = wordChars.some(char => activeChar === char);
  }
  return word;
}

//fisher-yates shuffle
export function shuffle<T>(array: T[]) {
  let currentIndex = array.length;

  //while there are remaining elements to shuffle
  while (currentIndex != 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    //swap with the current element
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}

export async function findUniqueFinishedLessons(options: {userId?: number | undefined, sessionToken?: string | undefined}) {
  const newCharacters = await prisma.lesson.findMany({
    select: {
      lessonCharacters: true,
      languageScript: {
        select: {languageScript: true}
      }
    },
    where: {
      mode: "new-characters",
      userId: options.userId,
      sessionToken: options.sessionToken,
      endTime: {not: null}
    },
    distinct: ["lessonCharacters"]
  });

  const wordExercise = await prisma.lesson.findMany({
    select: {
      lessonCharacters: true,
      languageScript: {
        select: {languageScript: true}
      }
    },
    where: {
      mode: "word-exercise",
      userId: options.userId,
      sessionToken: options.sessionToken,
      endTime: {not: null}
    },
    distinct: ["lessonCharacters"]
  });

  const lessonByLanguageScript: {[key: string]: {newCharacters: string[], wordExercise: string[]}} = {};
  //initialize all languageScripts
  for (const languageScript of Object.keys(LanguageScripts)) {
    lessonByLanguageScript[languageScript] = {newCharacters: [], wordExercise: []};
  }

  for(const lesson of newCharacters) {
    lessonByLanguageScript[lesson.languageScript.languageScript].newCharacters.push(lesson.lessonCharacters);
  }
  for(const lesson of wordExercise) {
    lessonByLanguageScript[lesson.languageScript.languageScript].wordExercise.push(lesson.lessonCharacters);
  }

  return {...lessonByLanguageScript};
}

export async function getNewsPosts() {
  return await prisma.newspost.findMany({
    select: {
      id: true,
      title: true,
      author: true,
      body: true,
      postDate: true,
      tags: true
    }
  });
}

//return if a single user is an admin based on loginToken
export async function userIsAdmin(token: string) {
  const user = await prisma.user.findUnique({
    select: {id: true, admin: true},
    where: {loginToken: token}
  });

  //no user found
  if (user === null) {
    return false;
  }

  return user.admin;
}

export async function findUserFromLoginToken(loginToken: string | undefined) {
  if (loginToken === undefined) return null;

  const user = await prisma.user.findFirst({
    where: {loginToken: loginToken}
  });
  
  return user;
}