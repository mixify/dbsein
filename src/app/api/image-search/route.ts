import { NextRequest, NextResponse } from "next/server";
import { scrapeImages } from "@/lib/image-search";

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  if (!query) {
    return NextResponse.json({ error: "query required" }, { status: 400 });
  }

  try {
    const images = await scrapeImages(query);
    return NextResponse.json({ images });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Image search failed";
    return NextResponse.json({ error: msg, images: [] }, { status: 500 });
  }
}
