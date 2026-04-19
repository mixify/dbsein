import { cookies } from "next/headers";

const TOKEN_COOKIE = "dbsein_token";

export async function isAuthorized(): Promise<boolean> {
  const writeToken = process.env.WRITE_TOKEN;
  if (!writeToken) return true; // no token configured = open access

  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE)?.value === writeToken;
}
