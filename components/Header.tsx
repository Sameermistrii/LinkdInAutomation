"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

type Props = {
  title: string;
  subtitle?: string;
  photoUrl?: string;
  name?: string;
  connected?: boolean;
  compact?: boolean;
};

export function Header({ title, subtitle, photoUrl, name, connected, compact }: Props) {
  return (
    <header className="mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-2 text-[var(--muted)]">{subtitle}</p> : null}
      </div>
      {compact ? null : (
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!connected ? (
            <Link
              href="/api/auth/linkedin"
              className="rounded-full bg-[#0a66c2] px-4 py-2 text-sm font-medium text-white"
            >
              Connect LinkedIn
            </Link>
          ) : null}
          <a href="/api/auth/logout" className="text-sm text-[var(--muted)]">
            Sign out
          </a>
          <div
            className="h-10 w-10 overflow-hidden rounded-full border border-[var(--line)] bg-[var(--blue-soft)]"
            title={name}
          >
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-medium text-[var(--blue)]">
                {(name || "U").slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
