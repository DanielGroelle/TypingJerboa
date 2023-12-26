import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { z } from "zod";

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

const Z_REQUEST = z.object({
  id: z.string()
});

export async function DELETE(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return new Response("Request was structured incorrectly", {status: 400})
  }

  const deleteResult = await prisma.race.delete({
    where: {id: request.id}
  })

  if (deleteResult === null) {
    return new Response ("Delete was unsuccessful", {status: 400});
  }

  return new Response(JSON.stringify({deleteResult}));
}