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

// --- Skill Branches ---

export type SkillBranch = 'builder' | 'grower' | 'operator' | 'visionary';

export interface BranchRank {
  rank: number;
  title: string;
  xpRequired: number;
}

export interface BranchDef {
  key: SkillBranch;
  label: string;
  color: string;       // Tailwind bg class
  textColor: string;   // Tailwind text class
  ranks: BranchRank[];
}

const BRANCH_RANKS = (titles: string[]): BranchRank[] => [
  { rank: 1, title: titles[0], xpRequired: 0 },
  { rank: 2, title: titles[1], xpRequired: 200 },
  { rank: 3, title: titles[2], xpRequired: 800 },
  { rank: 4, title: titles[3], xpRequired: 2_000 },
  { rank: 5, title: titles[4], xpRequired: 5_000 },
];

export const BRANCHES: BranchDef[] = [
  {
    key: 'builder',
    label: 'Builder',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    ranks: BRANCH_RANKS(['Tinkerer', 'Craftsman', 'Architect', 'Master Builder', 'Legendary Builder']),
  },
  {
    key: 'grower',
    label: 'Grower',
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    ranks: BRANCH_RANKS(['Cold Caller', 'Hustler', 'Pipeline Builder', 'Revenue Driver', 'Growth Machine']),
  },
  {
    key: 'operator',
    label: 'Operator',
    color: 'bg-amber-500',
    textColor: 'text-amber-600',
    ranks: BRANCH_RANKS(['Firefighter', 'Process Setter', 'Systems Thinker', 'Org Designer', 'Machine Builder']),
  },
  {
    key: 'visionary',
    label: 'Visionary',
    color: 'bg-purple-500',
    textColor: 'text-purple-600',
    ranks: BRANCH_RANKS(['Daydreamer', 'Strategist', 'Category Creator', 'Market Shaper', 'Legendary Founder']),
  },
];

export function getBranchRank(xp: number, branch: BranchDef): { rank: BranchRank; next: BranchRank | null; progressXp: number; neededXp: number; progressPercent: number } {
  let current = branch.ranks[0];
  for (const r of branch.ranks) {
    if (xp >= r.xpRequired) current = r;
    else break;
  }
  const next = branch.ranks.find((r) => r.rank === current.rank + 1) ?? null;
  if (!next) return { rank: current, next: null, progressXp: xp - current.xpRequired, neededXp: 0, progressPercent: 100 };
  const progressXp = xp - current.xpRequired;
  const neededXp = next.xpRequired - current.xpRequired;
  return { rank: current, next, progressXp, neededXp, progressPercent: Math.min(100, Math.floor((progressXp / neededXp) * 100)) };
}

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
