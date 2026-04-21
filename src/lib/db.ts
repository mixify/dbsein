import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "dbsein.db");

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH, {});
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS profile (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
  );

  INSERT OR IGNORE INTO profile (key, value) VALUES ('name', 'DBSein');
  INSERT OR IGNORE INTO profile (key, value) VALUES ('bio', 'my collection');

  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    creator TEXT,
    release_date TEXT,
    image_url TEXT,
    rating REAL CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
    review TEXT,
    reviewed_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Seed default categories if empty
const count = db.prepare("SELECT COUNT(*) as c FROM categories").get() as { c: number };
if (count.c === 0) {
  const insert = db.prepare("INSERT INTO categories (id, name, sort_order) VALUES (?, ?, ?)");
  const defaults = [
    ["music", "음악", 0],
    ["movie", "영화", 1],
    ["anime", "애니", 2],
    ["book", "책", 3],
  ];
  for (const [id, name, order] of defaults) {
    insert.run(id, name, order);
  }
}

export default db;
