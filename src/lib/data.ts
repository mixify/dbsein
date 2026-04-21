import db from "./db";
import type { Category, Item } from "@/types";

// Profile
export function getProfile(userId: string): Record<string, string> {
  const rows = db.prepare("SELECT key, value FROM profile WHERE user_id = ?").all(userId) as { key: string; value: string }[];
  const result: Record<string, string> = {};
  for (const row of rows) result[row.key] = row.value;
  return result;
}

export function updateProfile(userId: string, key: string, value: string) {
  db.prepare("INSERT OR REPLACE INTO profile (user_id, key, value) VALUES (?, ?, ?)").run(userId, key, value);
}

// Categories
export function getCategories(userId: string): Category[] {
  return db.prepare("SELECT * FROM categories WHERE user_id = ? ORDER BY sort_order").all(userId) as Category[];
}

export function addCategory(userId: string, name: string): Category {
  const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
  const maxOrder = db.prepare("SELECT MAX(sort_order) as m FROM categories WHERE user_id = ?").get(userId) as { m: number | null };
  const sortOrder = (maxOrder.m ?? -1) + 1;
  db.prepare("INSERT INTO categories (id, user_id, name, sort_order) VALUES (?, ?, ?, ?)").run(id, userId, name, sortOrder);
  return db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as Category;
}

export function renameCategory(id: string, name: string): Category | null {
  const result = db.prepare("UPDATE categories SET name = ? WHERE id = ?").run(name, id);
  if (result.changes === 0) return null;
  return db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as Category;
}

export function deleteCategory(id: string) {
  db.prepare("DELETE FROM categories WHERE id = ?").run(id);
}

// Items
const VALID_COLUMNS = new Set(["rating", "reviewed_at", "release_date", "updated_at", "creator", "title"]);

export function getItems(userId: string, categoryId?: string | null, sort: string = "updated_at_desc"): Item[] {
  const parts = sort.match(/^(.+)_(asc|desc)$/);
  const col = parts && VALID_COLUMNS.has(parts[1]) ? parts[1] : "updated_at";
  const dir = parts?.[2] === "asc" ? "ASC" : "DESC";

  let sql = `SELECT * FROM items WHERE user_id = ?`;
  const params: unknown[] = [userId];

  if (categoryId) {
    sql += ` AND category_id = ?`;
    params.push(categoryId);
  }

  sql += ` ORDER BY ${col} ${dir}`;

  return db.prepare(sql).all(...params) as Item[];
}

export function addItem(userId: string, item: Omit<Item, "id" | "created_at" | "updated_at" | "reviewed_at">): Item {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO items (id, user_id, category_id, title, creator, release_date, image_url, rating, review, reviewed_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, item.category_id, item.title, item.creator, item.release_date, item.image_url, item.rating, item.review, now, now, now);
  return db.prepare("SELECT * FROM items WHERE id = ?").get(id) as Item;
}

export function updateItem(id: string, fields: Partial<Item>): Item | null {
  const sets: string[] = [];
  const values: unknown[] = [];

  if (fields.title !== undefined) { sets.push("title = ?"); values.push(fields.title); }
  if (fields.creator !== undefined) { sets.push("creator = ?"); values.push(fields.creator); }
  if (fields.release_date !== undefined) { sets.push("release_date = ?"); values.push(fields.release_date); }
  if (fields.image_url !== undefined) { sets.push("image_url = ?"); values.push(fields.image_url); }
  if (fields.rating !== undefined) { sets.push("rating = ?"); values.push(fields.rating); }
  if (fields.review !== undefined) { sets.push("review = ?"); values.push(fields.review); }
  if (fields.category_id !== undefined) { sets.push("category_id = ?"); values.push(fields.category_id); }

  if (sets.length === 0) return null;

  sets.push("updated_at = ?");
  values.push(new Date().toISOString());
  values.push(id);

  const result = db.prepare(`UPDATE items SET ${sets.join(", ")} WHERE id = ?`).run(...values);
  if (result.changes === 0) return null;
  return db.prepare("SELECT * FROM items WHERE id = ?").get(id) as Item;
}

export function deleteItem(id: string) {
  db.prepare("DELETE FROM items WHERE id = ?").run(id);
}

// User lookup by username
export function getUserByUsername(username: string): { id: string; username: string } | null {
  const row = db.prepare("SELECT id, username FROM users WHERE username = ?").get(username) as { id: string; username: string } | undefined;
  return row || null;
}
