import db from "./db";
import type { Category, Item } from "@/types";

// Categories
export function getCategories(): Category[] {
  return db.prepare("SELECT * FROM categories ORDER BY sort_order").all() as Category[];
}

export function addCategory(name: string): Category {
  const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
  const maxOrder = db.prepare("SELECT MAX(sort_order) as m FROM categories").get() as { m: number | null };
  const sortOrder = (maxOrder.m ?? -1) + 1;
  db.prepare("INSERT INTO categories (id, name, sort_order) VALUES (?, ?, ?)").run(id, name, sortOrder);
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
export function getItems(categoryId?: string | null, sort: string = "reviewed_at"): Item[] {
  const orderCol = sort === "rating" ? "rating" : sort === "release_date" ? "release_date" : "reviewed_at";
  let sql = `SELECT * FROM items`;
  const params: unknown[] = [];

  if (categoryId) {
    sql += ` WHERE category_id = ?`;
    params.push(categoryId);
  }

  sql += ` ORDER BY ${orderCol} DESC`;

  return db.prepare(sql).all(...params) as Item[];
}

export function addItem(item: Omit<Item, "id" | "created_at" | "updated_at" | "reviewed_at">): Item {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO items (id, category_id, title, creator, release_date, image_url, rating, review, reviewed_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, item.category_id, item.title, item.creator, item.release_date, item.image_url, item.rating, item.review, now, now, now);
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
