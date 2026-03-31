export interface LevelDef {
  level: number;
  title: string;
  xpRequired: number;
}

export const LEVELS: LevelDef[] = [
  { level: 1,  title: 'Intern',                   xpRequired: 0 },
  { level: 2,  title: 'Individual Contributor',    xpRequired: 500 },
  { level: 3,  title: 'Manager of One',            xpRequired: 1_500 },
  { level: 4,  title: 'Head of Everything',        xpRequired: 3_500 },
  { level: 5,  title: 'VP of Getting It Done',     xpRequired: 7_000 },
  { level: 6,  title: 'Director of Chaos',         xpRequired: 12_000 },
  { level: 7,  title: 'Chief Operating Founder',   xpRequired: 20_000 },
  { level: 8,  title: 'Startup CEO',               xpRequired: 32_000 },
  { level: 9,  title: 'Scaled CEO',                xpRequired: 50_000 },
  { level: 10, title: 'Legendary Operator',        xpRequired: 75_000 },
];

export const XP_AWARDS = {
  top3:         30,
  outsource:    15,
  notToday:     10,
  allTop3Bonus: 50,
} as const;

export function getLevelFromXp(xp: number): LevelDef {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.xpRequired) current = l;
    else break;
  }
  return current;
}

export function getXpProgress(xp: number): {
  current: LevelDef;
  next: LevelDef | null;
  progressXp: number;
  neededXp: number;
  progressPercent: number;
} {
  const current = getLevelFromXp(xp);
  const next = LEVELS.find((l) => l.level === current.level + 1) ?? null;
  if (!next) {
    return { current, next: null, progressXp: xp - current.xpRequired, neededXp: 0, progressPercent: 100 };
  }
  const progressXp = xp - current.xpRequired;
  const neededXp = next.xpRequired - current.xpRequired;
  return { current, next, progressXp, neededXp, progressPercent: Math.min(100, Math.floor((progressXp / neededXp) * 100)) };
}
