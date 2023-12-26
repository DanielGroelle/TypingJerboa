import prisma from "@/lib/prisma";

export async function getRaces() {
  const returnedRaces = await prisma.race.findMany({
    select: {
      id: true,
      startTime: true,
      endTime: true,
      mistakes: true,
      paragraph: {
        select: {text: true}
      }
    }
  })
  
  return returnedRaces;
}
  
export async function GET() {
  const returnedRaces = await getRaces();

  if (returnedRaces === null) {
    return new Response("Fetch races failed", {status: 400});
  }

  return new Response(JSON.stringify({races: [...returnedRaces]}));
}