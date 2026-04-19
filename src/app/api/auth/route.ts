import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const writeToken = process.env.WRITE_TOKEN;

  if (!writeToken || token === writeToken) {
    const res = NextResponse.json({ authorized: true });
    if (token) {
      res.cookies.set("dbsein_token", token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: "/",
      });
    }
    return res;
  }

  return NextResponse.json({ authorized: false });
}
