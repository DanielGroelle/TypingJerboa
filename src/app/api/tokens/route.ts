import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

//removes old sessionTokens from db
export async function DELETE() {

  const deletedTokens = await prisma.session.deleteMany({
    where: {
      expiry: {
        lte: new Date()
      }
    }
  });

  if (!deletedTokens) {
    return NextResponse.json({error: "Error deleting sessionTokens"}, {status: 400});
  }

  return NextResponse.json({deletedTokens});
}