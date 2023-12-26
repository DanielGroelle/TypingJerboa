import prisma from "@/lib/prisma";
import {z} from "zod";

const Z_REQUEST = z.object({
  mistakes: z.number(),
  endTime: z.string(),
  raceId: z.string()
});

//end race
export async function POST(req: Request) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return new Response("Request was structured incorrectly", {status: 400})
  }

  //update the race with the endTime and the mistakes
  const raceFinishResult = await prisma.race.update({
    where: {id: request.raceId},
    data: {
      mistakes: request.mistakes,
      endTime: new Date(request.endTime)
    }
  });

  if (raceFinishResult === null) {
    return new Response("Race finish failed", {status: 400})
  }

  return new Response(JSON.stringify({raceFinishResult}));
}