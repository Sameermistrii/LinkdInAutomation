"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function OnboardingFrame({
  step,
  total = 3,
  children,
}: {
  step: number;
  total?: number;
  children: React.ReactNode;
}) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)]">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/home" className="text-lg font-semibold">
          UniSin
        </Link>
        <ThemeToggle />
      </header>
      <div className="mx-auto w-full max-w-4xl flex-1 px-6 pb-28">{children}</div>
      <div className="fixed inset-x-0 bottom-0 border-t border-[var(--line)] bg-[var(--card)]">
        <div className="h-1 bg-[var(--line)]">
          <div className="h-full bg-[var(--blue)]" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
