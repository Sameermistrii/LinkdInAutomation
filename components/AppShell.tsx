"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { CreatePostChooser } from "./CreatePostChooser";

type Props = {
  name: string;
  photoUrl: string;
  connected: boolean;
  children: React.ReactNode;
  greeting?: string;
};

const NAV = [
  { href: "/home", label: "Home", soon: false },
  { href: "/posts", label: "My posts", soon: false },
  { href: "/ai-buddy", label: "AI Buddy", soon: true },
  { href: "/engage", label: "Engage", soon: true },
];

export function AppShell({ name, photoUrl, connected, children, greeting }: Props) {
  const pathname = usePathname();
  const initial = (name || "U").slice(0, 1).toUpperCase();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-[var(--line)] bg-[var(--card)] px-4 py-5">
        <Link href="/home" className="mb-6 px-2 text-lg font-semibold tracking-tight">
          UniSin
        </Link>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-[var(--blue)] px-3 py-2.5 text-sm font-medium text-white"
        >
          <span className="text-lg leading-none">+</span> Create
        </button>
        <nav className="space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href === "/posts" && pathname.startsWith("/compose"));
            return (
              <Link
                key={item.href}
                href={item.soon ? item.href : item.href}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                  active ? "bg-[var(--blue-soft)] font-medium text-[var(--blue)]" : "text-[var(--ink)]"
                }`}
              >
                {item.label}
                {item.soon ? (
                  <span className="rounded-full bg-[var(--line)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted)]">
                    Soon
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3">
          {!connected ? (
            <Link
              href="/api/auth/linkedin"
              className="block rounded-xl bg-[#0a66c2] px-3 py-2 text-center text-sm font-medium text-white"
            >
              Connect LinkedIn
            </Link>
          ) : null}
          <div className="border-t border-[var(--line)] pt-3">
            <p className="px-2 text-xs text-[var(--muted)]">
              Made with 💙 by{" "}
              <a
                href="https://github.com/Sameermistrii"
                target="_blank"
                rel="noreferrer"
                className="text-[var(--blue)] hover:underline"
              >
                Sameer Mistri
              </a>
            </p>
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3 px-8 py-5">
          <div>
            {greeting ? <h1 className="text-2xl font-semibold tracking-tight">{greeting}</h1> : null}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a href="/api/auth/logout" className="text-sm text-[var(--muted)]">
              Sign out
            </a>
            <div className="h-10 w-10 overflow-hidden rounded-full border border-[var(--line)] bg-[var(--blue-soft)]" title={name}>
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-medium text-[var(--blue)]">
                  {initial}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="px-8 pb-12">{children}</div>
      </div>
      <CreatePostChooser open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
