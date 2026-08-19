export type Topic = { slug: string; label: string; keywords: string[] };

export const TOPICS: Topic[] = [
  { slug: "ai", label: "Artificial Intelligence", keywords: ["artificial intelligence", "ai", "genai", "llm"] },
  { slug: "machine-learning", label: "Machine Learning", keywords: ["machine learning", "ml", "deep learning"] },
  { slug: "data-science", label: "Data Science", keywords: ["data science", "data scientist", "analytics"] },
  { slug: "big-data", label: "Big Data", keywords: ["big data", "data engineer"] },
  { slug: "software", label: "Software Engineering", keywords: ["software", "engineer", "developer", "programming"] },
  { slug: "product", label: "Product Management", keywords: ["product manager", "product management", "pm"] },
  { slug: "startups", label: "Startups", keywords: ["startup", "founder", "entrepreneur"] },
  { slug: "entrepreneurship", label: "Entrepreneurship", keywords: ["entrepreneur", "founder", "bootstrapped"] },
  { slug: "leadership", label: "Leadership", keywords: ["leadership", "manager", "director", "head of"] },
  { slug: "career", label: "Professional Development", keywords: ["career", "mentor", "coach", "student"] },
  { slug: "education", label: "Education", keywords: ["education", "university", "institute", "professor"] },
  { slug: "cybersecurity", label: "Cybersecurity", keywords: ["security", "cyber", "infosec"] },
  { slug: "cloud", label: "Cloud Computing", keywords: ["cloud", "aws", "azure", "gcp"] },
  { slug: "devops", label: "DevOps", keywords: ["devops", "sre", "platform"] },
  { slug: "design", label: "Product Design", keywords: ["design", "ux", "ui", "designer"] },
  { slug: "marketing", label: "Marketing", keywords: ["marketing", "growth", "brand"] },
  { slug: "sales", label: "Sales", keywords: ["sales", "revenue", "b2b"] },
  { slug: "finance", label: "Finance", keywords: ["finance", "fintech", "investor", "vc"] },
  { slug: "venture", label: "Venture Capital", keywords: ["venture", "vc", "investor"] },
  { slug: "innovation", label: "Innovation", keywords: ["innovation", "r&d"] },
  { slug: "blockchain", label: "Blockchain", keywords: ["blockchain", "web3", "crypto"] },
  { slug: "iot", label: "Internet of Things", keywords: ["iot", "embedded"] },
  { slug: "robotics", label: "Robotics", keywords: ["robot", "robotics"] },
  { slug: "climate", label: "Climate Tech", keywords: ["climate", "sustainability", "renewable"] },
  { slug: "health", label: "Health Tech", keywords: ["health", "medtech", "biotech"] },
  { slug: "writing", label: "Content & Writing", keywords: ["writer", "content", "creator"] },
  { slug: "hr", label: "People & Culture", keywords: ["hr", "people", "talent"] },
  { slug: "strategy", label: "Business Strategy", keywords: ["strategy", "consultant", "operations"] },
];

export function slugifyLabel(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "custom";
}

export function suggestTopicsFromHeadline(headline: string, limit = 3) {
  const text = headline.toLowerCase();
  const scored = TOPICS.map((topic) => ({
    topic,
    score: topic.keywords.reduce((n, k) => n + (text.includes(k) ? k.length : 0), 0),
  }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  const picked = scored.slice(0, limit).map((x) => x.topic);
  if (picked.length >= limit) return picked;
  const fallback = TOPICS.filter((t) => !picked.some((p) => p.slug === t.slug)).slice(0, limit - picked.length);
  return [...picked, ...fallback];
}

export function ideaPromptsForTopic(label: string) {
  return [
    `Share one lesson from ${label} you learned this week.`,
    `What is a common myth about ${label} that you still hear?`,
    `Write a short playbook: how a beginner can start in ${label}.`,
    `What would you tell your past self about ${label}?`,
  ];
}
