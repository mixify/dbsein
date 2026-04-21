import { NextRequest, NextResponse } from "next/server";
import { getItems, addItem, updateItem, deleteItem, getUserByUsername } from "@/lib/data";
import { isAuthorized, getCurrentUser } from "@/lib/auth";

const UNAUTHORIZED = NextResponse.json({ error: "unauthorized" }, { status: 401 });

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const username = params.get("username");
  const categoryId = params.get("categoryId");
  const sort = params.get("sort") || "updated_at_desc";

  let userId: string;
  if (username) {
    const user = getUserByUsername(username);
    if (!user) return NextResponse.json([]);
    userId = user.id;
  } else {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json([]);
    userId = currentUser.id;
  }

  return NextResponse.json(getItems(userId, categoryId, sort));
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized())) return UNAUTHORIZED;
  const currentUser = await getCurrentUser();
  if (!currentUser) return UNAUTHORIZED;
  const body = await req.json();
  const { categoryId, title, creator, releaseDate, imageUrl, rating, review } = body;

  if (!categoryId || !title) return NextResponse.json({ error: "categoryId and title required" }, { status: 400 });

  const item = addItem(currentUser.id, {
    category_id: categoryId,
    title,
    creator: creator || null,
    release_date: releaseDate || null,
    image_url: imageUrl || null,
    rating: rating != null ? rating : null,
    review: review || null,
  });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthorized())) return UNAUTHORIZED;
  const body = await req.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updateData: Record<string, unknown> = {};
  if (fields.title !== undefined) updateData.title = fields.title;
  if (fields.creator !== undefined) updateData.creator = fields.creator;
  if (fields.releaseDate !== undefined) updateData.release_date = fields.releaseDate;
  if (fields.imageUrl !== undefined) updateData.image_url = fields.imageUrl;
  if (fields.rating !== undefined) updateData.rating = fields.rating;
  if (fields.review !== undefined) updateData.review = fields.review;
  if (fields.categoryId !== undefined) updateData.category_id = fields.categoryId;

  const item = updateItem(id, updateData);
  if (!item) return NextResponse.json({ error: "item not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthorized())) return UNAUTHORIZED;
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  deleteItem(id);
  return NextResponse.json({ ok: true });
}
