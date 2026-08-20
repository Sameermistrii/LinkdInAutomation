"use client";

import { useEffect, useMemo, useState } from "react";
import { slugifyLabel } from "@/lib/topics";
import { parseLinkedInProfileUrl, leaderPhoto } from "@/lib/thought-leaders";

type Tab = "persona" | "interests" | "leaders";
type Topic = { slug: string; label: string };
type Leader = {
  id?: string;
  catalogId?: string;
  name: string;
  headline: string;
  linkedinUrl: string;
  photoUrl?: string;
  custom?: boolean;
};

export function PreferencesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("persona");
  const [personaBio, setPersonaBio] = useState("");
  const [companyBio, setCompanyBio] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selected, setSelected] = useState<Topic[]>([]);
  const [customTopic, setCustomTopic] = useState("");
  const [allLeaders, setAllLeaders] = useState<(Leader & { id: string })[]>([]);
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [customLeaders, setCustomLeaders] = useState<{ url: string; name: string; headline: string; photoUrl: string }[]>([]);
  const [leaderUrl, setLeaderUrl] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTab("persona");
    setError("");
    void fetch("/api/onboarding")
      .then((r) => r.json())
      .then((j) => {
        setPersonaBio(j.profile?.personaBio || defaultIntro(j.profile));
        setCompanyBio(j.profile?.companyBio || "");
        const topicList: Topic[] = j.topics ?? [];
        setTopics(topicList);
        const savedInterests: Topic[] = (j.interests ?? [])
          .map((item: Topic) => ({ slug: item.slug, label: item.label }))
          .filter((item: Topic) => item.slug && item.label);
        if (savedInterests.length) setSelected(savedInterests);
        else {
          const suggested = (j.suggested as string[]) ?? [];
          setSelected(topicList.filter((t) => suggested.includes(t.slug)).slice(0, 5));
        }
        const pool: (Leader & { id: string })[] = j.allLeaders?.length ? j.allLeaders : j.catalog ?? [];
        setAllLeaders(pool);
        const saved = (j.savedLeaders ?? []) as Leader[];
        const savedIds = saved.filter((s) => s.catalogId).map((s) => s.catalogId as string);
        if (savedIds.length) setPickedIds(savedIds);
        else setPickedIds((j.catalog ?? []).slice(0, 2).map((c: { id: string }) => c.id));
        setCustomLeaders(
          saved
            .filter((s) => s.custom)
            .map((s) => ({
              url: s.linkedinUrl,
              name: s.name,
              headline: s.headline || "",
              photoUrl: s.photoUrl || leaderPhoto({ name: s.name, linkedinUrl: s.linkedinUrl }),
            })),
        );
      });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const selectedSlugs = useMemo(() => new Set(selected.map((t) => t.slug)), [selected]);
  const suggestions = topics.filter((t) => !selectedSlugs.has(t.slug));
  const selectedLeaders = useMemo(() => {
    const fromCatalog = allLeaders.filter((c) => pickedIds.includes(c.id));
    const fromCustom = customLeaders.map((row) => ({
      id: row.url,
      name: row.name,
      headline: row.headline || "Added from LinkedIn URL",
      linkedinUrl: row.url,
      photoUrl: row.photoUrl,
      custom: true,
    }));
    return [...fromCustom, ...fromCatalog];
  }, [allLeaders, pickedIds, customLeaders]);
  const suggestedLeaders = allLeaders.filter((c) => !pickedIds.includes(c.id)).slice(0, 12);

  async function save() {
    setSaving(true);
    setError("");
    const payload =
      tab === "persona"
        ? { action: "persona", personaBio, companyBio }
        : tab === "interests"
          ? { action: "interests", interests: selected }
          : {
              action: "leaders",
              catalogIds: pickedIds,
              custom: customLeaders.map((row) => ({ url: row.url, name: row.name })),
            };
    const res = await fetch("/api/onboarding", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(json.error || "Could not save");
      return;
    }
    onClose();
  }

  function addTopic() {
    const label = customTopic.trim();
    if (!label) return;
    const slug = slugifyLabel(label);
    if (selected.some((t) => t.slug === slug)) return;
    if (selected.length >= 10) {
      setError("Choose up to 10 topics");
      return;
    }
    setSelected((prev) => [...prev, { slug, label }]);
    setCustomTopic("");
    setError("");
  }

  function addLeaderUrl() {
    const parsed = parseLinkedInProfileUrl(leaderUrl);
    if (!parsed) {
      setError("Paste a LinkedIn profile URL such as https://www.linkedin.com/in/username");
      return;
    }
    if (customLeaders.some((c) => c.url === parsed.url)) return;
    if (pickedIds.length + customLeaders.length >= 10) {
      setError("Pick up to 10 thought leaders");
      return;
    }
    setCustomLeaders((prev) => [
      ...prev,
      {
        url: parsed.url,
        name: parsed.name,
        headline: "",
        photoUrl: leaderPhoto({ name: parsed.name, linkedinUrl: parsed.url }),
      },
    ]);
    setLeaderUrl("");
    setError("");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-stretch justify-center bg-black/45 sm:items-center sm:p-4" onClick={onClose} role="presentation">
      <div
        className="flex h-full w-full max-w-5xl flex-col overflow-hidden bg-white shadow-2xl sm:h-[min(720px,90vh)] sm:rounded-2xl lg:flex-row dark:bg-[var(--card)]"
        role="dialog"
        aria-labelledby="prefs-title"
        onClick={(e) => e.stopPropagation()}
      >
        <aside className="flex w-full shrink-0 flex-row gap-1 overflow-x-auto border-b border-[var(--line)] bg-[#f8fafc] p-3 lg:w-56 lg:flex-col lg:overflow-visible lg:border-r lg:border-b-0 lg:p-4 dark:bg-[var(--bg)]">
          <p className="mb-0 hidden px-2 text-xs font-bold tracking-wide text-[var(--muted)] uppercase lg:mb-3 lg:block">Your persona</p>
          <NavBtn active={tab === "persona"} onClick={() => setTab("persona")} label="Personalization" />
          <NavBtn active={tab === "interests"} onClick={() => setTab("interests")} label="Your interests" />
          <NavBtn active={tab === "leaders"} onClick={() => setTab("leaders")} label="Ideal influencers" />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] px-4 py-4 sm:px-8 sm:py-5">
            <div>
              <h2 id="prefs-title" className="text-xl font-semibold">
                {tab === "persona" ? "Personalization" : tab === "interests" ? "Your interests" : "Ideal influencers"}
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {tab === "persona"
                  ? "Help us understand you better to create more relevant and engaging content."
                  : tab === "interests"
                    ? "Select 2–10 topics you’re passionate about to personalize your feed."
                    : "Select 2–10 people who inspire you. Add them with a LinkedIn URL or from suggestions."}
              </p>
            </div>
            <button type="button" onClick={onClose} className="text-2xl leading-none text-[var(--muted)]" aria-label="Close">
              ×
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-6">
            {tab === "persona" ? (
              <div className="space-y-5">
                <label className="block text-sm font-semibold">Tell us about yourself</label>
                <div className="relative">
                  <textarea
                    value={personaBio}
                    onChange={(e) => setPersonaBio(e.target.value.slice(0, 5000))}
                    rows={8}
                    className="w-full rounded-xl border border-[var(--line)] bg-[#f8fafc] p-4 text-sm outline-none focus:ring-2 focus:ring-[#004e99] dark:bg-[var(--bg)]"
                  />
                  <p className="mt-1 text-right text-xs text-[var(--muted)]">{personaBio.length}/5000</p>
                </div>
                <label className="block text-sm font-semibold">Describe your company</label>
                <div>
                  <textarea
                    value={companyBio}
                    onChange={(e) => setCompanyBio(e.target.value.slice(0, 5000))}
                    rows={4}
                    placeholder="Provide information about your company such as its industry, size, and main focus."
                    className="w-full rounded-xl border border-[var(--line)] bg-[#f8fafc] p-4 text-sm outline-none placeholder:text-[var(--muted)] focus:ring-2 focus:ring-[#004e99] dark:bg-[var(--bg)]"
                  />
                  <p className="mt-1 text-right text-xs text-[var(--muted)]">{companyBio.length}/5000</p>
                </div>
              </div>
            ) : null}

            {tab === "interests" ? (
              <div>
                <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTopic();
                      }
                    }}
                    placeholder="Enter your topic here"
                    className="h-11 flex-1 rounded-xl border border-[var(--line)] px-4 text-sm outline-none focus:ring-2 focus:ring-[#004e99]"
                  />
                  <button
                    type="button"
                    onClick={addTopic}
                    className="h-11 w-full rounded-xl bg-[#4d7cff] px-4 text-sm font-semibold text-white sm:w-auto"
                  >
                    + Add
                  </button>
                </div>
                <p className="mb-2 text-sm font-semibold">Selected topics ({selected.length}/10)</p>
                <div className="mb-6 flex flex-wrap gap-2">
                  {selected.map((topic) => (
                    <button
                      key={topic.slug}
                      type="button"
                      onClick={() => setSelected((prev) => prev.filter((t) => t.slug !== topic.slug))}
                      className="rounded-full border border-[#004e99] px-3 py-1.5 text-sm text-[#004e99]"
                    >
                      {topic.label} ×
                    </button>
                  ))}
                </div>
                <p className="mb-2 text-sm font-semibold">Suggested topics</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((topic) => (
                    <button
                      key={topic.slug}
                      type="button"
                      onClick={() => {
                        if (selected.length >= 10) return setError("Choose up to 10 topics");
                        setSelected((prev) => [...prev, topic]);
                      }}
                      className="rounded-full border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[#004e99] hover:text-[#004e99]"
                    >
                      + {topic.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {tab === "leaders" ? (
              <div>
                <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={leaderUrl}
                    onChange={(e) => setLeaderUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addLeaderUrl();
                      }
                    }}
                    placeholder="i.e. https://www.linkedin.com/in/username"
                    className="h-11 flex-1 rounded-xl border border-[var(--line)] px-4 text-sm outline-none focus:ring-2 focus:ring-[#004e99]"
                  />
                  <button
                    type="button"
                    onClick={addLeaderUrl}
                    className="h-11 w-full rounded-xl bg-[#4d7cff] px-4 text-sm font-semibold text-white sm:w-auto"
                  >
                    + Add
                  </button>
                </div>
                <p className="mb-3 text-sm font-semibold">Selected profiles ({selectedLeaders.length}/10)</p>
                <div className="space-y-2">
                  {selectedLeaders.map((leader) => (
                    <div
                      key={leader.linkedinUrl + leader.name}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <LeaderAvatar name={leader.name} src={leader.photoUrl} url={leader.linkedinUrl} />
                        <div className="min-w-0">
                          <p className="font-semibold">{leader.name}</p>
                          <p className="truncate text-sm text-[var(--muted)]">{leader.headline || "LinkedIn profile"}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 text-sm text-[var(--muted)] hover:text-red-600"
                        onClick={() => {
                          if (leader.custom) setCustomLeaders((prev) => prev.filter((x) => x.url !== leader.linkedinUrl));
                          else setPickedIds((prev) => prev.filter((id) => id !== leader.id));
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                {suggestedLeaders.length ? (
                  <>
                    <p className="mt-6 mb-3 text-sm font-semibold">Suggestions</p>
                    <div className="space-y-2">
                      {suggestedLeaders.map((leader) => (
                        <div
                          key={leader.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] px-4 py-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <LeaderAvatar name={leader.name} src={leader.photoUrl} url={leader.linkedinUrl} />
                            <div className="min-w-0">
                              <p className="font-semibold">{leader.name}</p>
                              <p className="truncate text-sm text-[var(--muted)]">{leader.headline}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="shrink-0 text-sm font-semibold text-[#004e99]"
                            onClick={() => {
                              if (pickedIds.length + customLeaders.length >= 10) return setError("Pick up to 10 thought leaders");
                              setPickedIds((prev) => [...prev, leader.id]);
                            }}
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[var(--line)] px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-8">
            {error ? <p className="text-sm text-red-600 sm:mr-auto">{error}</p> : null}
            <button type="button" onClick={onClose} className="w-full rounded-lg border border-[var(--line)] px-4 py-2 text-sm sm:w-auto">
              Discard
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="w-full rounded-lg bg-[#4d7cff] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaderAvatar({ name, src, url }: { name: string; src?: string; url?: string }) {
  const photo = src || leaderPhoto({ name, linkedinUrl: url });
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photo} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
  );
}

function NavBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mb-0 w-auto shrink-0 rounded-lg px-3 py-2 text-left text-sm whitespace-nowrap lg:mb-1 lg:w-full ${
        active ? "bg-[#e8eefc] font-semibold text-[#004e99]" : "text-[var(--muted)] hover:bg-white"
      }`}
    >
      {label}
    </button>
  );
}

function defaultIntro(profile?: { name?: string; headline?: string }) {
  const name = profile?.name || "This member";
  const headline = profile?.headline;
  if (!headline) return `${name} uses UniSin to schedule LinkedIn posts through the official API.`;
  return `${name} is ${headline.replace(/^is\s+/i, "")}. This profile will help UniSin’s upcoming AI Buddy write in their voice.`;
}
