import prisma from "@/lib/prisma";

//convert a language script to its corresponding id
export async function getLanguageScriptId(languageScript: string) {
  return await prisma.languageScript.findFirst({
    select: {id: true},
    where: {languageScript}
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
  const newWords = words.map((word)=>{return {word, languageScriptId}});
  const wordInsertCount = await prisma.word.createMany({
    data: newWords,
    skipDuplicates: true,
  });

  return wordInsertCount;
}