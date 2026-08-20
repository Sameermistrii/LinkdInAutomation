import Link from "next/link";
import { BrandMark } from "./BrandMark";

export function LandingHeader() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-[var(--line)]/60 bg-[var(--card)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:h-20 md:px-10">
        <BrandMark href="/" size="md" />
        <nav className="flex items-center gap-3 sm:gap-6">
          <Link href="/login" className="hidden text-sm font-medium text-[var(--muted)] hover:text-[var(--blue)] sm:inline">
            Sign in
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-[var(--blue)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--blue)]/20 hover:opacity-95 sm:px-5"
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
