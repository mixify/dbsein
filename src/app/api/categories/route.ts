import { NextRequest, NextResponse } from "next/server";
import { getCategories, addCategory, renameCategory, deleteCategory } from "@/lib/data";
import { isAuthorized } from "@/lib/auth";

const UNAUTHORIZED = NextResponse.json({ error: "unauthorized" }, { status: 401 });

export async function GET() {
  return NextResponse.json(getCategories());
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized())) return UNAUTHORIZED;
  const { name } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  const cat = addCategory(name);
  return NextResponse.json(cat);
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthorized())) return UNAUTHORIZED;
  const { categoryId, name } = await req.json();
  if (!categoryId || !name) {
    return NextResponse.json({ error: "categoryId and name required" }, { status: 400 });
  }
  const cat = renameCategory(categoryId, name);
  if (!cat) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(cat);
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthorized())) return UNAUTHORIZED;
  const { categoryId } = await req.json();
  if (!categoryId) {
    return NextResponse.json({ error: "categoryId required" }, { status: 400 });
  }
  deleteCategory(categoryId);
  return NextResponse.json({ ok: true });
}
