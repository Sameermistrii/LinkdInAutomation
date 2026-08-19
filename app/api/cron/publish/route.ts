import { NextResponse } from "next/server";
import { publishDuePosts } from "@/lib/publish";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") || "";
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const results = await publishDuePosts();
  return NextResponse.json({ ok: true, results });
}

export async function POST(request: Request) {
  return GET(request);
}
