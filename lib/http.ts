import { NextResponse } from "next/server";

// Shared `{ error }` JSON for API routes.
export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
