import { NextResponse } from "next/server";
import { getNewsPosts } from "../utility/utility";

//need to force dynamic since next tries to do static optimization
export const dynamic = "force-dynamic";

//fetch all news posts
export async function GET() {
  const newsPosts = await getNewsPosts();

  if (newsPosts === null) {
    return NextResponse.json({error: "Error fetching news posts"}, {status: 400});
  }

  return new NextResponse(JSON.stringify({newsPosts}));
}