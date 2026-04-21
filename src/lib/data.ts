import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import type { Category, Item } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const ROOT_DIR = process.cwd();

function readJson<T>(filename: string): T {
  const filepath = path.join(DATA_DIR, filename);
  return JSON.parse(fs.readFileSync(filepath, "utf-8"));
}

function writeJson(filename: string, data: unknown) {
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function autoCommit(message: string) {
  try {
    execSync(`git add data/ public/images/ && git commit -m "${message}"`, {
      cwd: ROOT_DIR,
      encoding: "utf-8",
      timeout: 10000,
    });
    // push if GITHUB_TOKEN is set
    const token = process.env.GITHUB_TOKEN;
    if (token) {
      execSync(`git pull origin main --rebase --no-edit 2>/dev/null; git push origin main`, {
        cwd: ROOT_DIR,
        encoding: "utf-8",
        timeout: 30000,
        shell: "/bin/sh",
      });
    }
  } catch {
    // no changes to commit or git not available
  }
}

// Categories
export function getCategories(): Category[] {
  return readJson<Category[]>("categories.json");
}

export function addCategory(name: string): Category {
  const categories = getCategories();
  const maxOrder = categories.reduce((max, c) => Math.max(max, c.sort_order), -1);
  const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
  const newCat: Category = { id, name, sort_order: maxOrder + 1 };
  categories.push(newCat);
  writeJson("categories.json", categories);
  autoCommit(`add category: ${name}`);
  return newCat;
}

export function renameCategory(id: string, name: string): Category | null {
  const categories = getCategories();
  const idx = categories.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  categories[idx].name = name;
  writeJson("categories.json", categories);
  autoCommit(`rename category: ${name}`);
  return categories[idx];
}

export function deleteCategory(id: string) {
  const categories = getCategories().filter((c) => c.id !== id);
  writeJson("categories.json", categories);
  // Also remove items in that category
  const items = getItems().filter((i) => i.category_id !== id);
  writeJson("items.json", items);
  autoCommit(`delete category: ${id}`);
}

// Items
export function getItems(): Item[] {
  return readJson<Item[]>("items.json");
}

export function addItem(item: Omit<Item, "id" | "created_at" | "updated_at" | "reviewed_at">): Item {
  const items = getItems();
  const now = new Date().toISOString();
  const newItem: Item = {
    ...item,
    id: crypto.randomUUID(),
    reviewed_at: now,
    created_at: now,
    updated_at: now,
  };
  items.push(newItem);
  writeJson("items.json", items);
  autoCommit(`add: ${item.title}`);
  return newItem;
}

export function updateItem(id: string, fields: Partial<Item>): Item | null {
  const items = getItems();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...fields, updated_at: new Date().toISOString() };
  writeJson("items.json", items);
  autoCommit(`update: ${items[idx].title}`);
  return items[idx];
}

export function deleteItem(id: string) {
  const items = getItems();
  const item = items.find((i) => i.id === id);
  const remaining = items.filter((i) => i.id !== id);
  writeJson("items.json", remaining);
  autoCommit(`delete: ${item?.title || id}`);
}
