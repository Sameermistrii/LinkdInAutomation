export type TabKey = "queued" | "published" | "draft" | "error";

const TABS: { key: TabKey; label: string }[] = [
  { key: "queued", label: "Scheduled" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "error", label: "Errors" },
];

export function StatusTabs({
  active,
  counts,
  onChange,
}: {
  active: TabKey;
  counts: Record<TabKey, number>;
  onChange: (key: TabKey) => void;
}) {
  return (
    <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg bg-[#f0f4f8] p-1 dark:bg-[var(--card)]">
      {TABS.map((tab) => {
        const selected = tab.key === active;
        const count = counts[tab.key] ?? 0;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`flex shrink-0 items-center gap-1 rounded px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
              selected
                ? "bg-white text-[var(--ink)] shadow-sm dark:bg-[var(--bg)]"
                : "text-[var(--muted)] hover:bg-white/60 dark:hover:bg-[var(--line)]"
            }`}
          >
            {tab.label}
            {selected ? (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#004e99] text-[10px] font-bold text-white">
                {count}
              </span>
            ) : (
              <span className="ml-1 text-[var(--muted)]">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
