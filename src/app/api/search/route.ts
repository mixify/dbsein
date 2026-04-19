import { NextRequest, NextResponse } from "next/server";
import { searchMetadata } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const { title, categories } = await req.json();

  if (!title || !categories || !Array.isArray(categories)) {
    return NextResponse.json(
      { error: "title and categories[] required" },
      { status: 400 }
    );
  }

  try {
    const candidates = await searchMetadata(title, categories);
    return NextResponse.json({ candidates });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Search failed";
    return NextResponse.json({ error: msg, candidates: [] }, { status: 500 });
  }
}
