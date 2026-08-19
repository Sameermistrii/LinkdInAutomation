import { prisma } from "./prisma";

export async function upsertUser(input: {
  email: string;
  name: string;
  picture: string;
  provider: "google" | "linkedin";
}) {
  const email = input.email.trim().toLowerCase() || `${input.provider}-${Date.now()}@users.local`;
  return prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: input.name,
      picture: input.picture,
      provider: input.provider,
    },
    update: {
      name: input.name || undefined,
      picture: input.picture || undefined,
    },
  });
}
