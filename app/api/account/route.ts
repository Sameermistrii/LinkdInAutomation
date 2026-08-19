import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchAdminOrganizations, getValidAccessToken } from "@/lib/linkedin";
import { requireUser } from "@/lib/session";

export async function GET() {
  const { session, error } = await requireUser();
  if (error || !session) return error!;
  const account = await prisma.linkedInAccount.findUnique({ where: { userId: session.userId } });
  const organizations = await prisma.organization.findMany({
    where: { userId: session.userId },
    orderBy: { name: "asc" },
  });
  if (!account) {
    return NextResponse.json({ connected: false, account: null, organizations });
  }
  return NextResponse.json({
    connected: true,
    account: {
      name: account.name,
      headline: account.headline,
      photoUrl: account.photoUrl,
      personUrn: account.personUrn,
      email: account.email,
    },
    organizations,
  });
}

export async function POST() {
  const { session, error } = await requireUser();
  if (error || !session) return error!;
  try {
    const { token } = await getValidAccessToken(session.userId);
    const orgs = await fetchAdminOrganizations(token);
    await prisma.organization.deleteMany({ where: { userId: session.userId } });
    if (orgs.length) {
      await prisma.organization.createMany({
        data: orgs.map((o) => ({ ...o, userId: session.userId })),
      });
    }
    return NextResponse.json({ organizations: orgs });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not refresh pages";
    return NextResponse.json({ error: message, organizations: [] }, { status: 403 });
  }
}
