import { NextResponse } from "next/server";
import { getRecentActivity } from "@/lib/forum-data";

export async function GET() {
  const items = await getRecentActivity();
  return NextResponse.json(items);
}
