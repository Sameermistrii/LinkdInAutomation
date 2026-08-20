import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildAuthUrl, getLinkedInConfig } from "@/lib/linkedin";

export async function GET(request: Request) {
  const { clientId } = getLinkedInConfig();
  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  if (!clientId) {
    return NextResponse.redirect(
      new URL("/login?error=Sign-in%20is%20temporarily%20unavailable", origin),
    );
  }
  const includeOrg = new URL(request.url).searchParams.get("org") === "1";
  const state = crypto.randomUUID();
  const jar = await cookies();
  jar.set("li_oauth_state", state, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 });
  jar.set("li_oauth_org", includeOrg ? "1" : "0", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return NextResponse.redirect(buildAuthUrl(state, includeOrg));
}
