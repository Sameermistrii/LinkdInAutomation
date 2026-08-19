"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PostPreview } from "./PostPreview";

const EMOJIS = ["👍", "🙏", "🔥", "💡", "🚀", "✨", "👏", "😊", "💼", "✅"];

type Org = { urn: string; name: string; logoUrl?: string };

type Account = {
  name: string;
  headline: string;
  photoUrl: string;
};

type Post = {
  id?: number;
  body: string;
  firstComment: string;
  mediaPath: string;
  mediaType: string;
  authorType: "PERSON" | "ORGANIZATION";
  organizationUrn: string;
  scheduledAt?: string | null;
};

export function Composer({
  initial,
  slot,
  idea,
  account,
  organizations,
}: {
  initial?: Partial<Post> & { id?: number };
  slot?: string | null;
  idea?: string | null;
  account: Account | null;
  organizations: Org[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [body, setBody] = useState(initial?.body ?? idea ?? "");
  const [firstComment, setFirstComment] = useState(initial?.firstComment ?? "");
  const [showComment, setShowComment] = useState(Boolean(initial?.firstComment));
  const [mediaPath, setMediaPath] = useState(initial?.mediaPath ?? "");
  const [mediaType, setMediaType] = useState(initial?.mediaType ?? "");
  const [authorType, setAuthorType] = useState<"PERSON" | "ORGANIZATION">(
    initial?.authorType ?? "PERSON",
  );
  const [organizationUrn, setOrganizationUrn] = useState(initial?.organizationUrn ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const mediaUrl = mediaPath
    ? mediaPath.startsWith("http://") || mediaPath.startsWith("https://")
      ? mediaPath
      : `/api/media/${mediaPath.split("/").pop()}`
    : "";
  const selectedOrg = organizations.find((o) => o.urn === organizationUrn);
  const displayName =
    authorType === "ORGANIZATION" ? selectedOrg?.name || "Company Page" : account?.name || "Your name";
  const displayPhoto =
    authorType === "ORGANIZATION" ? selectedOrg?.logoUrl : account?.photoUrl;
  const displayHeadline =
    authorType === "ORGANIZATION" ? "Company Page" : account?.headline || "";

  useEffect(() => {
    if (organizations[0] && !organizationUrn) setOrganizationUrn(organizations[0].urn);
  }, [organizations, organizationUrn]);

  async function upload(file: File) {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Upload failed");
    setMediaPath(json.mediaPath);
    setMediaType(json.mediaType);
  }

  function payload(extra?: Record<string, unknown>) {
    return {
      body,
      firstComment: showComment ? firstComment : "",
      mediaPath,
      mediaType,
      authorType,
      organizationUrn: authorType === "ORGANIZATION" ? organizationUrn : "",
      ...extra,
    };
  }

  async function save(action: "draft" | "next-slot" | "slot" | "now") {
    setSaving(true);
    setError("");
    try {
      const extra: Record<string, unknown> =
        action === "draft"
          ? { status: "draft" }
          : action === "next-slot"
            ? { action: "next-slot" }
            : action === "now"
              ? { action: "now" }
              : { status: "queued", scheduledAt: slot };

      const url = initial?.id ? `/api/posts/${initial.id}` : "/api/posts";
      const method = initial?.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(extra)),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save");
      router.push("/posts");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => router.push("/posts")} className="text-sm text-[var(--muted)]">
          ← My posts
        </button>
        <div className="flex flex-wrap items-center gap-2">
          {organizations.length > 0 ? (
            <select
              value={authorType === "ORGANIZATION" ? organizationUrn : "PERSON"}
              onChange={(e) => {
                if (e.target.value === "PERSON") setAuthorType("PERSON");
                else {
                  setAuthorType("ORGANIZATION");
                  setOrganizationUrn(e.target.value);
                }
              }}
              className="rounded-full border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-sm"
            >
              <option value="PERSON">Personal profile</option>
              {organizations.map((org) => (
                <option key={org.urn} value={org.urn}>
                  {org.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-[var(--muted)]">
              Company Pages appear after LinkedIn approves the Community Management product.
            </span>
          )}
        </div>
      </div>

      <PostPreview
        device={device}
        onDevice={setDevice}
        name={displayName}
        headline={displayHeadline}
        photoUrl={displayPhoto}
        body={body}
        mediaUrl={mediaUrl}
        mediaType={mediaType}
        onEditBody={() => textareaRef.current?.focus()}
      />

      <div className="mx-auto mt-3 flex max-w-[680px] items-center justify-between px-2">
        <div className="flex items-center gap-1">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file).catch((err) => setError(err.message));
            }}
          />
          <IconBtn label="Add image" onClick={() => fileRef.current?.click()}>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="8.5" cy="10" r="1.5" />
            <path d="M21 16l-5-5-8 8" />
          </IconBtn>
          <IconBtn
            label="Add document"
            onClick={() => {
              if (fileRef.current) {
                fileRef.current.accept = "application/pdf";
                fileRef.current.click();
                fileRef.current.accept = "image/jpeg,image/png,image/gif,image/webp,application/pdf";
              }
            }}
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
          </IconBtn>
          <div className="relative">
            <IconBtn label="Emoji" onClick={() => setShowEmoji((v) => !v)}>
              <circle cx="12" cy="12" r="9" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <circle cx="9" cy="10" r="0.8" fill="currentColor" />
              <circle cx="15" cy="10" r="0.8" fill="currentColor" />
            </IconBtn>
            {showEmoji ? (
              <div className="absolute top-10 left-0 z-10 flex gap-1 rounded-xl border border-[var(--line)] bg-[var(--card)] p-2 shadow">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    className="text-lg"
                    onClick={() => {
                      setBody((b) => b + e);
                      setShowEmoji(false);
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        {mediaPath ? (
          <button
            type="button"
            className="text-sm text-[var(--muted)]"
            onClick={() => {
              setMediaPath("");
              setMediaType("");
            }}
          >
            Remove media
          </button>
        ) : null}
      </div>

      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your LinkedIn post…"
        className="mx-auto mt-4 block w-full max-w-[680px] min-h-28 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 outline-none"
      />

      <div className="mx-auto mt-4 w-full max-w-[680px]">
        {showComment ? (
          <textarea
            value={firstComment}
            onChange={(e) => setFirstComment(e.target.value)}
            placeholder="First comment"
            className="min-h-20 w-full rounded-2xl border border-dashed border-sky-300 bg-[var(--card)] p-4 outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowComment(true)}
            className="flex w-full items-center gap-2 rounded-2xl border border-dashed border-sky-300 px-4 py-3 text-left text-[var(--muted)]"
          >
            <span className="text-lg">+</span> Add first comment
          </button>
        )}
      </div>

      {error ? <p className="mx-auto mt-4 max-w-[680px] text-sm text-red-600">{error}</p> : null}

      <div className="mx-auto mt-6 flex max-w-[680px] flex-wrap justify-end gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => void save("draft")}
          className="rounded-full border border-[var(--line)] px-4 py-2 text-sm"
        >
          Save draft
        </button>
        {slot ? (
          <button
            type="button"
            disabled={saving}
            onClick={() => void save("slot")}
            className="rounded-full bg-[var(--blue)] px-4 py-2 text-sm font-medium text-white"
          >
            Add to this slot
          </button>
        ) : (
          <button
            type="button"
            disabled={saving}
            onClick={() => void save("next-slot")}
            className="rounded-full bg-[var(--blue)] px-4 py-2 text-sm font-medium text-white"
          >
            Add to queue
          </button>
        )}
        <button
          type="button"
          disabled={saving}
          onClick={() => void save("now")}
          className="rounded-full bg-[#0a66c2] px-4 py-2 text-sm font-medium text-white"
        >
          Post now
        </button>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--card)]"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        {children}
      </svg>
    </button>
  );
}
