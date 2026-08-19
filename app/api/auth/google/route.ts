import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildGoogleAuthUrl, getGoogleConfig } from "@/lib/google";

export async function GET(request: Request) {
  const { clientId } = getGoogleConfig();
  if (!clientId) {
    return NextResponse.redirect(
      new URL("/login?error=Sign-in%20is%20temporarily%20unavailable", request.url),
    );
  }
  const email = new URL(request.url).searchParams.get("email") || "";
  const state = crypto.randomUUID();
  const jar = await cookies();
  jar.set("g_oauth_state", state, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 });
  return NextResponse.redirect(buildGoogleAuthUrl(state, email || undefined));
}

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") || "").trim();
  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const target = new URL("/api/auth/google", origin);
  if (email) target.searchParams.set("email", email);
  return NextResponse.redirect(target, 303);
}
