import { mkdir, writeFile, readFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

function blobEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function mediaPreviewUrl(mediaPath: string) {
  if (!mediaPath) return "";
  if (mediaPath.startsWith("http://") || mediaPath.startsWith("https://")) return mediaPath;
  const name = mediaPath.split("/").pop();
  return name ? `/api/media/${name}` : "";
}

export async function saveUpload(file: File) {
  const ext = file.name.split(".").pop() || "bin";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (blobEnabled()) {
    const blob = await put(`uploads/${name}`, bytes, {
      access: "public",
      contentType: file.type || "application/octet-stream",
    });
    return { mediaPath: blob.url, mediaType: file.type, url: blob.url };
  }

  const dir = path.join(process.cwd(), "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return {
    mediaPath: `uploads/${name}`,
    mediaType: file.type,
    url: `/api/media/${name}`,
  };
}

export async function readMediaBytes(mediaPath: string) {
  if (mediaPath.startsWith("http://") || mediaPath.startsWith("https://")) {
    const res = await fetch(mediaPath);
    if (!res.ok) throw new Error("Could not download media");
    return Buffer.from(await res.arrayBuffer());
  }
  return readFile(path.join(process.cwd(), mediaPath));
}
