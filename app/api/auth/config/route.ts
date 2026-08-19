import { NextResponse } from "next/server";
import { getGoogleConfig } from "@/lib/google";
import { getLinkedInConfig } from "@/lib/linkedin";

export async function GET() {
  const google = getGoogleConfig();
  const linkedin = getLinkedInConfig();
  return NextResponse.json({
    google: Boolean(google.clientId && google.clientSecret),
    linkedin: Boolean(linkedin.clientId && linkedin.clientSecret),
  });
}
