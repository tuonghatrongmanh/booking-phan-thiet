import { NextResponse } from "next/server";
import { getTopMembers } from "@/lib/forum-data";

export async function GET() {
  const members = await getTopMembers();
  return NextResponse.json(members);
}
