import { NextRequest, NextResponse } from "next/server";
import { createUser, verifyUser, createSession, deleteSession, getCurrentUser } from "@/lib/auth";

// GET: check current session
export async function GET() {
  const user = await getCurrentUser();
  if (user) {
    return NextResponse.json({ authorized: true, username: user.username });
  }
  return NextResponse.json({ authorized: false });
}

// POST: login or register
export async function POST(req: NextRequest) {
  const { action, username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "username and password required" }, { status: 400 });
  }

  if (action === "register") {
    const user = createUser(username, password);
    if (!user) {
      return NextResponse.json({ error: "username already exists" }, { status: 409 });
    }
    const token = createSession(user.id);
    const res = NextResponse.json({ ok: true, username });
    res.cookies.set("dbsein_session", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    return res;
  }

  // login
  const user = verifyUser(username, password);
  if (!user) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }
  const token = createSession(user.id);
  const res = NextResponse.json({ ok: true, username });
  res.cookies.set("dbsein_session", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return res;
}

// DELETE: logout
export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("dbsein_session")?.value;
  if (token) deleteSession(token);
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("dbsein_session");
  return res;
}
