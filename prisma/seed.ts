import prisma from "../src/lib/prisma";

async function main() {
  const CYRILLIC_RUSSIAN = await prisma.languageScript.create({
    data: {
      languageScript: 'cyrillic-russian',
      paragraphs: {
        create: {
          text: "Обернувшись, он заметил человека небольшого роста, в старом поношенном вицмундире, и не без ужаса узнал в нем Акакия Акакиевича. Лицо чиновника было бледно, как снег, и глядело совершенным мертвецом.",
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
          text: "The theory of music emphasizes the elements from which music is composed. One such structure is the melody, which is a grouping of musical notes that combine into a basic, but immensely flexible structure. Another is the chord, which is two or more notes played simultaneously to create a harmony.",
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