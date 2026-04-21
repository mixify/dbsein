import { NextRequest, NextResponse } from "next/server";
import { getProfile, updateProfile } from "@/lib/data";
import { isAuthorized } from "@/lib/auth";

export async function GET() {
  return NextResponse.json(getProfile());
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { key, value } = await req.json();
  if (!key) {
    return NextResponse.json({ error: "key required" }, { status: 400 });
  }
  updateProfile(key, value);
  return NextResponse.json({ ok: true });
}
