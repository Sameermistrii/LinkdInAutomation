import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { exchangeGoogleCode, fetchGoogleUser } from "@/lib/google";
import { setSession } from "@/lib/session";
import { upsertUser } from "@/lib/users";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_APP_URL || url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const jar = await cookies();
  const expected = jar.get("g_oauth_state")?.value;

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, origin));
  }
  if (!code || !state || !expected || state !== expected) {
    return NextResponse.redirect(new URL("/login?error=Invalid%20Google%20sign-in", origin));
  }

  try {
    const accessToken = await exchangeGoogleCode(code);
    const profile = await fetchGoogleUser(accessToken);
    const user = await upsertUser({
      email: profile.email || "",
      name: profile.name || profile.email || "Google user",
      picture: profile.picture || "",
      provider: "google",
    });
    await setSession({
      userId: user.id,
      provider: "google",
      email: user.email,
      name: user.name,
      picture: user.picture,
    });
    jar.delete("g_oauth_state");
    return NextResponse.redirect(new URL("/home", origin));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Google sign-in failed";
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, origin));
  }
}
