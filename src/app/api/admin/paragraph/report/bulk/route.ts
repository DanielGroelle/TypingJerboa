import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Z_DELETE_REQUEST = z.object({
  ids: z.array(z.number())
});
//bulk delete paragraph reports
export async function DELETE(req: NextRequest) {
  let request;
  try {
    request = Z_DELETE_REQUEST.parse(await req.json());
  }
  catch(e: unknown) {
    return NextResponse.json({error: "Request was structured incorrectly"}, {status: 400});
  }

  const deletedWordCount = await prisma.paragraphReport.deleteMany({
    where: {
      id: {in: request.ids}
    }
  });

  if (deletedWordCount === null) {
    return NextResponse.json({error: "Word ID does not exist"}, {status: 400});
  }
  
  return NextResponse.json({status: 200});
}