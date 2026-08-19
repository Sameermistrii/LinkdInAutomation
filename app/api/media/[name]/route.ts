import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  pdf: "application/pdf",
};

type Ctx = { params: Promise<{ name: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { name } = await ctx.params;
  if (name.includes("..") || name.includes("/") || name.includes("\\")) {
    return new NextResponse("Not found", { status: 404 });
  }
  try {
    const bytes = await readFile(path.join(process.cwd(), "uploads", name));
    const ext = name.split(".").pop()?.toLowerCase() || "";
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": TYPES[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
