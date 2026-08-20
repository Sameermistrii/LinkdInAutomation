export type CatalogLeader = {
  id: string;
  name: string;
  headline: string;
  linkedinUrl: string;
  tags: string[];
};

function avatar(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0a66c2&color=fff&size=128`;
}

// LinkedIn photo via unavatar, with a generated avatar fallback.
export function leaderPhoto(leader: { name: string; linkedinUrl?: string }) {
  const handle = leader.linkedinUrl?.match(/linkedin\.com\/in\/([^/?#]+)/i)?.[1];
  if (!handle) return avatar(leader.name);
  const fallback = avatar(leader.name);
  return `https://unavatar.io/linkedin/${encodeURIComponent(handle)}?fallback=${encodeURIComponent(fallback)}`;
}

export const THOUGHT_LEADERS: CatalogLeader[] = [
  { id: "andrew-ng", name: "Andrew Ng", headline: "AI educator and founder", linkedinUrl: "https://www.linkedin.com/in/andrewyng", tags: ["ai", "machine-learning", "education"] },
  { id: "fei-fei-li", name: "Fei-Fei Li", headline: "AI researcher and professor", linkedinUrl: "https://www.linkedin.com/in/fei-fei-li-4541247", tags: ["ai", "machine-learning", "education"] },
  { id: "yann-lecun", name: "Yann LeCun", headline: "Chief AI Scientist", linkedinUrl: "https://www.linkedin.com/in/yann-lecun", tags: ["ai", "machine-learning"] },
  { id: "demis-hassabis", name: "Demis Hassabis", headline: "AI research leader", linkedinUrl: "https://www.linkedin.com/in/demishassabis", tags: ["ai", "innovation"] },
  { id: "satya-nadella", name: "Satya Nadella", headline: "CEO, Microsoft", linkedinUrl: "https://www.linkedin.com/in/satyanadella", tags: ["leadership", "cloud", "software"] },
  { id: "sundar-pichai", name: "Sundar Pichai", headline: "CEO, Google and Alphabet", linkedinUrl: "https://www.linkedin.com/in/sundarpichai", tags: ["leadership", "software", "ai"] },
  { id: "reid-hoffman", name: "Reid Hoffman", headline: "Entrepreneur and investor", linkedinUrl: "https://www.linkedin.com/in/reidhoffman", tags: ["startups", "venture", "entrepreneurship"] },
  { id: "naval", name: "Naval Ravikant", headline: "Angel investor and founder", linkedinUrl: "https://www.linkedin.com/in/naval", tags: ["startups", "venture", "entrepreneurship"] },
  { id: "shreyas-doshi", name: "Shreyas Doshi", headline: "Product advisor", linkedinUrl: "https://www.linkedin.com/in/shreyasdoshi", tags: ["product", "leadership"] },
  { id: "lenny-rachitsky", name: "Lenny Rachitsky", headline: "Product and growth writer", linkedinUrl: "https://www.linkedin.com/in/lennyrachitsky", tags: ["product", "startups", "writing"] },
  { id: "julie-zhuo", name: "Julie Zhuo", headline: "Product design leader", linkedinUrl: "https://www.linkedin.com/in/juliezhou", tags: ["design", "product", "leadership"] },
  { id: "john-maeda", name: "John Maeda", headline: "Design and technology", linkedinUrl: "https://www.linkedin.com/in/johnmaeda", tags: ["design", "innovation"] },
  { id: "cassie-kozyrkov", name: "Cassie Kozyrkov", headline: "Decision intelligence", linkedinUrl: "https://www.linkedin.com/in/kozyrkov", tags: ["data-science", "ai", "leadership"] },
  { id: "dj-patil", name: "DJ Patil", headline: "Data science leader", linkedinUrl: "https://www.linkedin.com/in/dpatil", tags: ["data-science", "big-data", "ai"] },
  { id: "hamel-husain", name: "Hamel Husain", headline: "Machine learning engineer", linkedinUrl: "https://www.linkedin.com/in/hamelhusain", tags: ["machine-learning", "software", "ai"] },
  { id: "chip-huyen", name: "Chip Huyen", headline: "ML systems author", linkedinUrl: "https://www.linkedin.com/in/chiphuyen", tags: ["machine-learning", "software", "ai"] },
  { id: "kelsey-hightower", name: "Kelsey Hightower", headline: "Cloud and infrastructure", linkedinUrl: "https://www.linkedin.com/in/kelseyhightower", tags: ["cloud", "devops", "software"] },
  { id: "kelsey-hightower-2", name: "Charity Majors", headline: "Observability and engineering", linkedinUrl: "https://www.linkedin.com/in/charity-majors", tags: ["devops", "software", "leadership"] },
  { id: "simon-wardley", name: "Simon Wardley", headline: "Strategy mapping", linkedinUrl: "https://www.linkedin.com/in/simonwardley", tags: ["strategy", "innovation"] },
  { id: "ben-horowitz", name: "Ben Horowitz", headline: "Venture capitalist", linkedinUrl: "https://www.linkedin.com/in/behorowitz", tags: ["venture", "startups", "leadership"] },
  { id: "aileen-lee", name: "Aileen Lee", headline: "Venture investor", linkedinUrl: "https://www.linkedin.com/in/aileenlee", tags: ["venture", "startups"] },
  { id: "whitney-wolfe", name: "Whitney Wolfe Herd", headline: "Founder and CEO", linkedinUrl: "https://www.linkedin.com/in/whitneywolfe", tags: ["entrepreneurship", "leadership"] },
  { id: "tobi-lutke", name: "Tobi Lütke", headline: "CEO, Shopify", linkedinUrl: "https://www.linkedin.com/in/tobiaslutke", tags: ["entrepreneurship", "software", "leadership"] },
  { id: "brian-chesky", name: "Brian Chesky", headline: "CEO, Airbnb", linkedinUrl: "https://www.linkedin.com/in/brianchesky", tags: ["entrepreneurship", "design", "leadership"] },
  { id: "adam-grant", name: "Adam Grant", headline: "Organizational psychologist", linkedinUrl: "https://www.linkedin.com/in/adammgrant", tags: ["leadership", "career", "education"] },
  { id: "brene-brown", name: "Brené Brown", headline: "Researcher and author", linkedinUrl: "https://www.linkedin.com/in/brenebrown", tags: ["leadership", "career"] },
  { id: "simon-sinek", name: "Simon Sinek", headline: "Leadership author", linkedinUrl: "https://www.linkedin.com/in/simonsinek", tags: ["leadership", "career"] },
  { id: "gary-vaynerchuk", name: "Gary Vaynerchuk", headline: "Entrepreneur and marketer", linkedinUrl: "https://www.linkedin.com/in/garyvaynerchuk", tags: ["marketing", "entrepreneurship"] },
  { id: "ann-handley", name: "Ann Handley", headline: "Content and marketing", linkedinUrl: "https://www.linkedin.com/in/annhandley", tags: ["marketing", "writing"] },
  { id: "rand-fishkin", name: "Rand Fishkin", headline: "Marketing and SEO", linkedinUrl: "https://www.linkedin.com/in/randfishkin", tags: ["marketing", "startups"] },
  { id: "april-dunford", name: "April Dunford", headline: "Positioning expert", linkedinUrl: "https://www.linkedin.com/in/aprildunford", tags: ["marketing", "product", "startups"] },
  { id: "wes-kao", name: "Wes Kao", headline: "Marketing and courses", linkedinUrl: "https://www.linkedin.com/in/weskao", tags: ["marketing", "education", "writing"] },
  { id: "bruce-schneier", name: "Bruce Schneier", headline: "Security technologist", linkedinUrl: "https://www.linkedin.com/in/schneier", tags: ["cybersecurity"] },
  { id: "troy-hunt", name: "Troy Hunt", headline: "Web security", linkedinUrl: "https://www.linkedin.com/in/troyhunt", tags: ["cybersecurity", "software"] },
  { id: "katie-dill", name: "Katie Dill", headline: "Design leadership", linkedinUrl: "https://www.linkedin.com/in/katiedill", tags: ["design", "product"] },
  { id: "john-cutler", name: "John Cutler", headline: "Product research", linkedinUrl: "https://www.linkedin.com/in/johnpcutler", tags: ["product", "leadership"] },
  { id: "teresa-torres", name: "Teresa Torres", headline: "Product discovery", linkedinUrl: "https://www.linkedin.com/in/teresa-torres-930263", tags: ["product"] },
  { id: "marty-cagan", name: "Marty Cagan", headline: "Product leadership", linkedinUrl: "https://www.linkedin.com/in/cagan", tags: ["product", "leadership"] },
  { id: "indra-nooyi", name: "Indra Nooyi", headline: "Business leader", linkedinUrl: "https://www.linkedin.com/in/indra-nooyi", tags: ["leadership", "strategy"] },
  { id: "satish-d", name: "Addy Osmani", headline: "Engineering leadership", linkedinUrl: "https://www.linkedin.com/in/addyosmani", tags: ["software", "web"] },
];

const ADJACENT: Record<string, string[]> = {
  ai: ["machine-learning", "data-science"],
  "machine-learning": ["ai", "data-science"],
  "data-science": ["ai", "big-data", "machine-learning"],
  software: ["devops", "cloud", "product"],
  product: ["startups", "design", "leadership"],
  startups: ["entrepreneurship", "venture", "product"],
  leadership: ["career", "strategy"],
  marketing: ["writing", "startups"],
};

export function leadersForTopics(slugs: string[], limit = 18) {
  const expanded = new Set(slugs);
  for (const slug of slugs) {
    for (const extra of ADJACENT[slug] ?? []) expanded.add(extra);
  }
  const ranked = THOUGHT_LEADERS.map((leader) => ({
    leader,
    score: leader.tags.filter((t) => expanded.has(t)).length,
  }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  const picked = ranked.slice(0, limit).map((x) => x.leader);
  if (picked.length >= 9) return picked;
  const rest = THOUGHT_LEADERS.filter((l) => !picked.some((p) => p.id === l.id));
  return [...picked, ...rest].slice(0, Math.max(limit, 12));
}

export function getLeaderById(id: string) {
  return THOUGHT_LEADERS.find((l) => l.id === id) ?? null;
}

export function parseLinkedInProfileUrl(raw: string) {
  const trimmed = raw.trim();
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    if (!url.hostname.endsWith("linkedin.com")) return null;
    const match = url.pathname.match(/\/in\/([^/]+)/i);
    if (!match) return null;
    const slug = decodeURIComponent(match[1]).replace(/\/$/, "");
    return {
      url: `https://www.linkedin.com/in/${slug}`,
      name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    };
  } catch {
    return null;
  }
}
