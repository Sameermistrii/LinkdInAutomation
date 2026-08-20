import Link from "next/link";

// Logo is public/logo.png (transparent). Tab icon is favicon.png / app/icon.png.
export function BrandMark({
  href = "/home",
  size = "md",
  onClick,
  className = "",
}: {
  href?: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
}) {
  const icon = size === "lg" ? "h-9 w-9" : size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-lg" : "text-xl";

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`inline-flex items-center gap-2 font-semibold tracking-tight text-[#004e99] dark:text-[var(--blue)] ${text} ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="" className={`${icon} shrink-0 object-contain`} />
      UniSin
    </Link>
  );
}

export function BrandWord({ size = "md", className = "" }: { size?: "sm" | "md"; className?: string }) {
  const icon = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const text = size === "sm" ? "text-sm" : "text-lg";
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight text-[#004e99] ${text} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="" className={`${icon} shrink-0 object-contain`} />
      UniSin
    </span>
  );
}
