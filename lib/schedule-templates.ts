export type ScheduleRule = { weekday: number; time: string };

export type ScheduleTemplate = {
  id: string;
  name: string;
  blurb: string;
  days: number[];
  times: string[];
};

export const SCHEDULE_TEMPLATES: ScheduleTemplate[] = [
  {
    id: "workweek",
    name: "Work week",
    blurb: "Mon–Fri · 9:00 AM & 6:00 PM",
    days: [1, 2, 3, 4, 5],
    times: ["09:00", "18:00"],
  },
  {
    id: "morning",
    name: "Daily morning",
    blurb: "Every day · 8:30 AM",
    days: [0, 1, 2, 3, 4, 5, 6],
    times: ["08:30"],
  },
  {
    id: "growth",
    name: "3× a week",
    blurb: "Tue, Thu, Sat · 10:00 AM",
    days: [2, 4, 6],
    times: ["10:00"],
  },
  {
    id: "founder",
    name: "Founder cadence",
    blurb: "Mon, Wed, Fri · 8:00 AM & 1:00 PM",
    days: [1, 3, 5],
    times: ["08:00", "13:00"],
  },
];

export function rulesFromTemplate(template: ScheduleTemplate): ScheduleRule[] {
  const rules: ScheduleRule[] = [];
  for (const weekday of template.days) {
    for (const time of template.times) {
      rules.push({ weekday, time });
    }
  }
  return rules;
}

export function templateMatches(template: ScheduleTemplate, rules: ScheduleRule[]) {
  const expected = rulesFromTemplate(template);
  if (expected.length !== rules.length) return false;
  const key = (r: ScheduleRule) => `${r.weekday}-${r.time}`;
  const have = new Set(rules.map(key));
  return expected.every((r) => have.has(key(r)));
}
