import { NextRequest, NextResponse } from "next/server";
import { getProfile, updateProfile, getUserByUsername } from "@/lib/data";
import { isAuthorized, getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");
  if (username) {
    const user = getUserByUsername(username);
    if (!user) return NextResponse.json({});
    return NextResponse.json(getProfile(user.id));
  }
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({});
  return NextResponse.json(getProfile(currentUser.id));
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { key, value } = await req.json();
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
  updateProfile(currentUser.id, key, value);
  return NextResponse.json({ ok: true });
}
