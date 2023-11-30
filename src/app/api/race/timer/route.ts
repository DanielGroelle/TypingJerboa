import prisma from "@/lib/prisma";

export async function GET(req: Request) {

  return new Response();
}

export async function POST(req: Request) {
  const startTime = new Date(Date.now() + 5000);

  return new Response();
}