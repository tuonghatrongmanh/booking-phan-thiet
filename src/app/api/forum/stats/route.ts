import { NextResponse } from "next/server";
import { getForumStats } from "@/lib/forum-data";

export async function GET() {
  const stats = await getForumStats();
  return NextResponse.json(stats);
}
