import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import db from "./db";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function createUser(username: string, password: string): { id: string } | null {
  const id = randomBytes(16).toString("hex");
  const hash = hashPassword(password);
  try {
    db.prepare("INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)").run(id, username, hash);

    // Seed default categories
    const insertCat = db.prepare("INSERT INTO categories (id, user_id, name, sort_order) VALUES (?, ?, ?, ?)");
    const defaults = [
      ["music-" + id, "음악", 0],
      ["movie-" + id, "영화", 1],
      ["anime-" + id, "애니", 2],
      ["book-" + id, "책", 3],
    ];
    for (const [catId, name, order] of defaults) {
      insertCat.run(catId, id, name, order);
    }

    // Seed profile
    db.prepare("INSERT INTO profile (user_id, key, value) VALUES (?, 'name', ?)").run(id, username);

    return { id };
  } catch {
    return null;
  }
}

export function verifyUser(username: string, password: string): { id: string } | null {
  const hash = hashPassword(password);
  const user = db.prepare("SELECT id FROM users WHERE username = ? AND password_hash = ?").get(username, hash) as { id: string } | undefined;
  return user || null;
}

export function createSession(userId: string): string {
  const token = randomBytes(32).toString("hex");
  db.prepare("INSERT INTO sessions (token, user_id) VALUES (?, ?)").run(token, userId);
  return token;
}

export function getSessionUser(token: string): { id: string; username: string } | null {
  const row = db.prepare(
    "SELECT u.id, u.username FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ?"
  ).get(token) as { id: string; username: string } | undefined;
  return row || null;
}

export function deleteSession(token: string) {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export async function isAuthorized(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("dbsein_session")?.value;
  if (!token) return false;
  return getSessionUser(token) !== null;
}

export async function getCurrentUser(): Promise<{ id: string; username: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("dbsein_session")?.value;
  if (!token) return null;
  return getSessionUser(token);
}
