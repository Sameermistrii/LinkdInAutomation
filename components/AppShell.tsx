"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { CreatePostChooser } from "./CreatePostChooser";
import { PreferencesModal } from "./PreferencesModal";
import { BrandMark } from "./BrandMark";

type Props = {
  name: string;
  photoUrl: string;
  connected: boolean;
  children: React.ReactNode;
  greeting?: string;
};

const NAV = [
  { href: "/home", label: "Home", soon: false, icon: "home" as const },
  { href: "/posts", label: "My posts", soon: false, icon: "posts" as const },
  { href: "/ai-buddy", label: "AI Buddy", soon: true, icon: "buddy" as const },
  { href: "/engage", label: "Engage", soon: true, icon: "engage" as const },
];

export function AppShell({ name, photoUrl, connected, children, greeting }: Props) {
  const pathname = usePathname();
  const initial = (name || "U").slice(0, 1).toUpperCase();
  const [createOpen, setCreateOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const sidebar = (
    <SidebarPanel
      pathname={pathname}
      connected={connected}
      onCreate={() => {
        setMenuOpen(false);
        setCreateOpen(true);
      }}
      onPrefs={() => {
        setMenuOpen(false);
        setPrefsOpen(true);
      }}
      onNavigate={() => setMenuOpen(false)}
    />
  );

  return (
    <div className="min-h-screen bg-[#f6fafe] text-[var(--ink)] dark:bg-[var(--bg)]">
      <aside className="fixed top-0 left-0 z-50 hidden h-full w-[240px] lg:flex">{sidebar}</aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative z-10 h-full w-[min(240px,85vw)] shadow-xl">{sidebar}</div>
        </div>
      ) : null}

      <div className="lg:pl-[240px]">
        <header className="fixed top-0 right-0 left-0 z-40 flex h-16 items-center justify-between gap-3 bg-[#f6fafe]/80 px-4 backdrop-blur-xl lg:left-[240px] lg:px-10 dark:bg-[var(--bg)]/80">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-[#e4e9ed] lg:hidden"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <MenuIcon />
            </button>
            <h1 className="truncate text-base font-semibold tracking-tight lg:text-xl">{greeting || "UniSin"}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-3 lg:gap-6">
            <ThemeToggle />
            <a
              href="/api/auth/logout"
              className="hidden text-sm font-semibold text-[var(--muted)] hover:text-red-600 lg:inline"
            >
              Sign out
            </a>
            <div
              className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#004e99] text-sm font-semibold text-white"
              title={name}
            >
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </div>
          </div>
        </header>
        <main className="min-h-screen bg-[#f6fafe] pt-16 dark:bg-[var(--bg)]">{children}</main>
      </div>
      <CreatePostChooser open={createOpen} onClose={() => setCreateOpen(false)} />
      <PreferencesModal open={prefsOpen} onClose={() => setPrefsOpen(false)} />
    </div>
  );
}

function SidebarPanel({
  pathname,
  connected,
  onCreate,
  onPrefs,
  onNavigate,
}: {
  pathname: string;
  connected: boolean;
  onCreate: () => void;
  onPrefs: () => void;
  onNavigate: () => void;
}) {
  return (
    <div className="flex h-full w-full flex-col border-r border-[#c1c6d4] bg-white py-6 dark:border-[var(--line)] dark:bg-[var(--card)]">
      <div className="mb-8 px-6">
        <BrandMark href="/home" size="lg" onClick={onNavigate} />
      </div>
      <div className="mb-6 px-6">
        <button
          type="button"
          onClick={onCreate}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0a66c2] py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          <PlusIcon />
          Create
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href === "/posts" && pathname.startsWith("/compose"));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center justify-between rounded-lg px-4 py-2 text-sm transition ${
                active
                  ? "bg-[#c4e7ff] font-semibold text-[#001e2c] dark:bg-[var(--blue-soft)] dark:text-[var(--blue)]"
                  : "text-[var(--muted)] hover:bg-[#e4e9ed] hover:text-[var(--ink)] dark:hover:bg-[var(--line)]"
              }`}
            >
              <span className="flex items-center gap-3">
                <NavIcon name={item.icon} />
                {item.label}
              </span>
              {item.soon ? (
                <span className="rounded-full bg-[#c4e7ff] px-2 py-0.5 text-[10px] font-bold text-[#001e2c] dark:bg-[var(--line)] dark:text-[var(--muted)]">
                  Soon
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-3 border-t border-[#c1c6d4] px-6 pt-6 dark:border-[var(--line)]">
        {!connected ? (
          <Link
            href="/api/auth/linkedin"
            onClick={onNavigate}
            className="block rounded-xl bg-[#0a66c2] px-3 py-2 text-center text-sm font-medium text-white"
          >
            Connect LinkedIn
          </Link>
        ) : null}
        <button
          type="button"
          onClick={onPrefs}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-[var(--muted)] hover:bg-[#e4e9ed] hover:text-[var(--ink)] dark:hover:bg-[var(--line)]"
        >
          <PrefIcon />
          Your preferences
        </button>
        <a href="/api/auth/logout" className="block px-2 text-sm font-semibold text-[var(--muted)] hover:text-red-600 lg:hidden">
          Sign out
        </a>
        <p className="px-2 text-xs font-bold tracking-wide text-[var(--muted)]">
          Made with 💙 by{" "}
          <a
            href="https://github.com/Sameermistrii"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-[var(--ink)] hover:text-[var(--blue)]"
          >
            Sameer Mistri
          </a>
        </p>
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function PrefIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function NavIcon({ name }: { name: "home" | "posts" | "buddy" | "engage" }) {
  const paths = {
    home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z",
    posts: "M7 3h8l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 0v6h6",
    buddy: "M12 3a4 4 0 0 1 4 4v1h1a3 3 0 0 1 0 6h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1 0-6h1V7a4 4 0 0 1 4-4Zm-2 8h.01M14 11h.01",
    engage: "M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z",
  };
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d={paths[name]} />
    </svg>
  );
}
