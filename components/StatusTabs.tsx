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
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const selected = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
              selected
                ? "border-[var(--blue)] bg-[var(--card)] text-[var(--ink)]"
                : "border-transparent bg-[var(--card)] text-[var(--muted)]"
            }`}
          >
            {tab.label}
            <span
              className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs ${
                selected ? "bg-[var(--blue)] text-white" : "bg-[var(--line)] text-[var(--muted)]"
              }`}
            >
              {counts[tab.key] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
