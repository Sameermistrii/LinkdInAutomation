import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  exchangeCodeForToken,
  fetchAdminOrganizations,
  fetchMemberExtras,
  fetchUserInfo,
} from "@/lib/linkedin";
import { getSession, setSession } from "@/lib/session";
import { upsertUser } from "@/lib/users";
import { ensureOnboardingFlag } from "@/lib/app-gate";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_APP_URL || url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");
  const jar = await cookies();
  const expected = jar.get("li_oauth_state")?.value;
  const existingSession = await getSession();
  const fail = (message: string) =>
    NextResponse.redirect(
      new URL(
        existingSession
          ? `/home?authError=${encodeURIComponent(message)}`
          : `/login?error=${encodeURIComponent(message)}`,
        origin,
      ),
    );

  if (error) {
    const retryPersonal = error === "unauthorized_scope_error" || errorDescription?.includes("scope");
    if (retryPersonal) {
      return NextResponse.redirect(new URL("/api/auth/linkedin?org=0", origin));
    }
    return fail(errorDescription || error);
  }

  if (!code || !state || !expected || state !== expected) {
    return fail("Invalid LinkedIn sign-in");
  }

  try {
    const token = await exchangeCodeForToken(code);
    const profile = await fetchUserInfo(token.access_token);
    const extra = await fetchMemberExtras(token.access_token).catch(() => ({ headline: "" }));
    if (!profile.sub) throw new Error("LinkedIn did not return a member id");
    const personId = profile.sub;
    const personUrn = `urn:li:person:${personId}`;
    const name =
      profile.name ||
      [profile.given_name, profile.family_name].filter(Boolean).join(" ") ||
      "LinkedIn member";
    const email = (profile.email || "").trim().toLowerCase();
    const photoUrl = profile.picture || "";
    const expiresAt = new Date(Date.now() + (token.expires_in ?? 3600) * 1000);

    let user =
      existingSession?.userId
        ? await prisma.user.findUnique({ where: { id: existingSession.userId } })
        : null;
    if (!user) {
      user = await upsertUser({
        email: email || `linkedin-${personId}@users.local`,
        name,
        picture: photoUrl,
        provider: "linkedin",
      });
    }

    const taken = await prisma.linkedInAccount.findUnique({ where: { personId } });
    if (taken && taken.userId !== user.id) {
      throw new Error("This LinkedIn account is already connected to another user.");
    }

    await prisma.linkedInAccount.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        personId,
        personUrn,
        name,
        headline: extra.headline,
        photoUrl,
        email,
        accessToken: token.access_token,
        refreshToken: token.refresh_token || "",
        tokenExpiresAt: expiresAt,
      },
      update: {
        personId,
        personUrn,
        name,
        headline: extra.headline,
        photoUrl,
        email,
        accessToken: token.access_token,
        refreshToken: token.refresh_token || "",
        tokenExpiresAt: expiresAt,
      },
    });

    try {
      const orgs = await fetchAdminOrganizations(token.access_token);
      await prisma.organization.deleteMany({ where: { userId: user.id } });
      if (orgs.length) {
        await prisma.organization.createMany({
          data: orgs.map((o) => ({ ...o, userId: user.id })),
        });
      }
    } catch {
      /* Community Management API may not be approved yet */
    }

    await setSession({
      userId: user.id,
      provider: existingSession?.provider || "linkedin",
      email: user.email,
      name: user.name || name,
      picture: user.picture || photoUrl,
    });

    jar.delete("li_oauth_state");
    jar.delete("li_oauth_org");
    const completed = await ensureOnboardingFlag(user.id);
    const dest = completed ? "/home?connected=1" : "/onboarding/interests";
    return NextResponse.redirect(new URL(dest, origin));
  } catch (err) {
    const message = err instanceof Error ? err.message : "OAuth failed";
    return fail(message);
  }
}
