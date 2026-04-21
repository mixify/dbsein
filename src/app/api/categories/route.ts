import { NextRequest, NextResponse } from "next/server";
import { getCategories, addCategory, renameCategory, deleteCategory, getUserByUsername } from "@/lib/data";
import { isAuthorized, getCurrentUser } from "@/lib/auth";

const UNAUTHORIZED = NextResponse.json({ error: "unauthorized" }, { status: 401 });

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");
  if (username) {
    const user = getUserByUsername(username);
    if (!user) return NextResponse.json([], { status: 404 });
    return NextResponse.json(getCategories(user.id));
  }
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json([]);
  return NextResponse.json(getCategories(currentUser.id));
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized())) return UNAUTHORIZED;
  const currentUser = await getCurrentUser();
  if (!currentUser) return UNAUTHORIZED;
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const cat = addCategory(currentUser.id, name);
  return NextResponse.json(cat);
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthorized())) return UNAUTHORIZED;
  const { categoryId, name } = await req.json();
  if (!categoryId || !name) return NextResponse.json({ error: "categoryId and name required" }, { status: 400 });
  const cat = renameCategory(categoryId, name);
  if (!cat) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(cat);
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthorized())) return UNAUTHORIZED;
  const { categoryId } = await req.json();
  if (!categoryId) return NextResponse.json({ error: "categoryId required" }, { status: 400 });
  deleteCategory(categoryId);
  return NextResponse.json({ ok: true });
}
