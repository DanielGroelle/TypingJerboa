import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getNewsPosts } from "../../utility/utility";
import { z } from "zod";

//return all newsPosts
export async function GET() {
  const returnedNewsPosts = await getNewsPosts();
  if (returnedNewsPosts === null) {
    return NextResponse.json({error: "Fetch newsPosts failed"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({newsPosts: [...returnedNewsPosts]}));
}

const Z_REQUEST = z.object({
  title: z.string(),
  author: z.string(),
  body: z.string(),
  tags: z.array(z.string())
});
//create newsPost
export async function POST(req: NextRequest) {
  let request;
  try {
    request = Z_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  const createdNewsPost = await prisma.newspost.create({
    select: {
      id: true,
      title: true,
      author: true,
      body: true,
      tags: true,
      postDate: true
    },
    data: {
      title: request.title,
      author: request.author,
      body: request.body,
      tags: request.tags,
      postDate: new Date()
    }
  });
  if (createdNewsPost === null) {
    return NextResponse.json({error: "NewsPost creation failed"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({...createdNewsPost}));
}

const Z_DELETE_REQUEST = z.object({
  id: z.number()
});
//delete newsPost
export async function DELETE(req: NextRequest) {
  let request;
  try {
    request = Z_DELETE_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  const deletedNewsPost = await prisma.newspost.delete({
    where: { id: request.id }
  });
  if (deletedNewsPost === null) {
    return NextResponse.json({error: "NewsPost ID does not exist"}, {status: 400});
  }
  
  return NextResponse.json({status: 200});
}