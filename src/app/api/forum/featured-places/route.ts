import { NextResponse } from "next/server";
import { getFeaturedPlaces } from "@/lib/forum-data";

export async function GET() {
  const places = await getFeaturedPlaces();
  return NextResponse.json(places);
}
