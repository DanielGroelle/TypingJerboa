import prisma from "../src/lib/prisma";

//npx prisma db seed
async function main() {
  //DROPS ALL RACES, PARAGRAPHS, AND LANGUAGESCRIPTS
  // await prisma.race.deleteMany();
  // await prisma.paragraph.deleteMany();
  // await prisma.languageScript.deleteMany();

  const CYRILLIC_RUSSIAN = await prisma.languageScript.create({
    data: {
      languageScript: 'cyrillic-russian',
      paragraphs: {
        create: {
          text: "Лежи в цветах - сама, как сад в цвету. Твоя постель из пепла и гранита. Я руки над тобой переплету и окроплю слезами эти плиты. А завтра снова принесу цветов и забросаю ими твой покров.",
          source: "Ромео и Джульетта",
          author: "У.Шейкспир",
          languageScriptIndex: 0
        },
      },
    }
  });
  const LATIN_ENGLISH = await prisma.languageScript.create({
    data: {
      languageScript: 'latin-english',
      paragraphs: {
        create: {
          text: "Music finds a comfortable parallel with that of human language. Much as language has words, sentences, and stories, music has tones, melodies, and songs.",
          source: "Civilization IV",
          author: "Sid Meier",
          languageScriptIndex: 0
        },
      },
    }
  });
  
  console.log({ CYRILLIC_RUSSIAN, LATIN_ENGLISH })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
})