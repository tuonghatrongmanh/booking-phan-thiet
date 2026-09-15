import { NextResponse } from "next/server";
import { getTopHashtags } from "@/lib/forum-data";

export async function GET() {
  const hashtags = await getTopHashtags();
  return NextResponse.json(hashtags);
}
