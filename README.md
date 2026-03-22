# PGAME — Daily Operating System for Founders

A ruthless AI chief of staff that tells you what to do, what not to do, and what to delegate. Built for founders with limited deep work capacity (~3h/day) and too many tasks.

## Core Principle

If a task is not one of today's top 3 priorities, it should be delegated, postponed, automated, or ignored.

## Features

- **Top 3 Priorities** — AI-scored daily priorities that fit your deep work budget
- **Not-to-do List** — Tasks to resist today, with reasoning
- **Outsource/Delegate** — Auto-assigned tasks with generated delegation briefs
- **Recalculate** — Re-run the scoring engine anytime
- **Task Inbox** — Add and score new tasks
- **Settings** — Configure deep work hours, delegation team, view scoring logic

## Scoring

```
score = (revenueImpact x 3) + (urgency x 2) + (leverage x 2) + (founderOnly ? 10 : 0) + deadlineBonus
```

## Stack

Next.js 14 · TypeScript · Tailwind CSS

## Run

```bash
npm install && npm run dev
```
