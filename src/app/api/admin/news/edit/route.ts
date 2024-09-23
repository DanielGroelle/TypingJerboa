import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Z_REQUEST = z.object({
  id: z.number(),
  title: z.string(),
  author: z.string(),
  body: z.string(),
  tags: z.array(z.string())
});
//edit newsPost
export async function POST(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  const updatedNewsPost = await prisma.newspost.update({
    select: {
      id: true,
      title: true,
      author: true,
      body: true,
      postDate: true,
      tags: true
    },
    where: { id: request.id },
    data: {
      title: request.title,
      author: request.author,
      body: request.body,
      tags: request.tags
    }
  });
  if (updatedNewsPost === null) {
    return NextResponse.json({error: "NewsPost ID does not exist"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({...updatedNewsPost}));
}