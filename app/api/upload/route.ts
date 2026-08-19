import { jsonError } from "@/lib/http";
import { saveUpload } from "@/lib/media";
import { requireUser } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { error } = await requireUser();
  if (error) return error;
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return jsonError("Choose a file");

  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
  if (!allowed.includes(file.type)) return jsonError("Use a JPG, PNG, GIF, WebP, or PDF");

  const saved = await saveUpload(file);
  return NextResponse.json(saved);
}
