"use client";

type Device = "mobile" | "tablet" | "desktop";

export function PostPreview({
  device,
  onDevice,
  name,
  headline,
  photoUrl,
  body,
  mediaUrl,
  mediaType,
  onEditBody,
}: {
  device: Device;
  onDevice: (d: Device) => void;
  name: string;
  headline: string;
  photoUrl?: string;
  body: string;
  mediaUrl?: string;
  mediaType?: string;
  onEditBody: () => void;
}) {
  const width =
    device === "mobile" ? "max-w-[380px]" : device === "tablet" ? "max-w-[560px]" : "max-w-[680px]";

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex items-center gap-1 rounded-xl bg-[var(--card)] p-1">
        <DeviceBtn active={device === "mobile"} onClick={() => onDevice("mobile")} label="Phone">
          <path d="M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
        </DeviceBtn>
        <DeviceBtn active={device === "tablet"} onClick={() => onDevice("tablet")} label="Tablet">
          <rect x="5" y="3" width="14" height="18" rx="2" />
        </DeviceBtn>
        <DeviceBtn active={device === "desktop"} onClick={() => onDevice("desktop")} label="Desktop">
          <rect x="3" y="5" width="18" height="12" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </DeviceBtn>
      </div>

      <div className={`card w-full ${width} overflow-hidden`}>
        <div className="flex items-start gap-3 p-4">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-amber-300">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-semibold">
                {(name || "U").slice(0, 1)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold uppercase tracking-wide">{name || "Your name"}</p>
            <p className="truncate text-sm text-[var(--muted)]">
              {headline || "Your LinkedIn headline"}
            </p>
            <p className="text-xs text-[var(--muted)]">Just now</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onEditBody}
          className="min-h-40 w-full px-4 pb-3 text-left whitespace-pre-wrap"
        >
          {body ? (
            <span>{body}</span>
          ) : (
            <span className="inline-flex items-center gap-2 text-sm text-[var(--muted)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
              Click to edit.
            </span>
          )}
        </button>
        {mediaUrl && mediaType?.startsWith("image/") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl} alt="" className="max-h-80 w-full object-cover" />
        ) : null}
        {mediaUrl && mediaType === "application/pdf" ? (
          <div className="mx-4 mb-3 rounded-lg border border-[var(--line)] px-3 py-2 text-sm">
            Document attached
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DeviceBtn({
  active,
  onClick,
  children,
  label,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`rounded-lg p-2 ${active ? "bg-[var(--line)]" : "text-[var(--muted)]"}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        {children}
      </svg>
    </button>
  );
}
