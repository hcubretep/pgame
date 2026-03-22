import { Task, Delegate } from '@/types';

function deadlineBonus(deadline?: string): number {
  if (!deadline) return 0;
  const now = new Date();
  const dl = new Date(deadline);
  const daysUntil = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil <= 0) return 5; // overdue
  if (daysUntil <= 1) return 4;
  if (daysUntil <= 3) return 3;
  if (daysUntil <= 7) return 1;
  return 0;
}

export function scoreTask(task: Task): number {
  return (
    task.revenueImpact * 3 +
    task.urgency * 2 +
    task.leverage * 2 +
    (task.founderOnly ? 10 : 0) +
    deadlineBonus(task.deadline)
  );
}

export function generateReasoning(task: Task): string {
  const parts: string[] = [];

  if (task.founderOnly) parts.push('Only you can do this');
  if (task.revenueImpact >= 4) parts.push('High revenue impact');
  if (task.urgency >= 4) parts.push('Time-sensitive');
  if (task.leverage >= 4) parts.push('High leverage — multiplies output');
  if (task.deadline) {
    const daysUntil = Math.ceil(
      (new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntil <= 1) parts.push('Due today or overdue');
    else if (daysUntil <= 3) parts.push(`Due in ${daysUntil} days`);
  }

  if (parts.length === 0) parts.push('Scored based on combined urgency, revenue, and leverage');

  return parts.join('. ') + '.';
}

export function findBestDelegate(task: Task, delegates: Delegate[]): string {
  // Find delegate whose capabilities match the task category
  const match = delegates.find((d) => d.capabilities.includes(task.category));
  if (match) return match.name;

  // If founder-only but low score, suggest AI
  if (!task.founderOnly) return 'AI Agent';

  return 'Unassigned';
}

export function generateDelegationBrief(task: Task, delegateTo: string): string {
  return `**Task:** ${task.title}

**Assigned to:** ${delegateTo}

**Context:** ${task.description}

**Category:** ${task.category}

**Urgency:** ${task.urgency}/5 | **Revenue Impact:** ${task.revenueImpact}/5

**Expected output:** Complete this task and report back with results.

**Deadline:** ${task.deadline || 'No hard deadline — aim for this week.'}`;
}

export function prioritizeTasks(
  tasks: Task[],
  deepWorkHours: number,
  delegates: Delegate[]
): Task[] {
  // Only work with inbox tasks
  const inboxTasks = tasks.filter((t) => t.status === 'inbox');
  const otherTasks = tasks.filter((t) => t.status !== 'inbox');

  // Score and sort
  const scored = inboxTasks
    .map((t) => ({ task: t, score: scoreTask(t) }))
    .sort((a, b) => b.score - a.score);

  // Fill top 3 within deep work budget
  let hoursUsed = 0;
  let top3Count = 0;
  const result: Task[] = [];

  for (const { task, score } of scored) {
    if (top3Count < 3 && hoursUsed + task.estimatedHours <= deepWorkHours) {
      result.push({
        ...task,
        status: 'top3',
        reasoning: generateReasoning(task),
      });
      hoursUsed += task.estimatedHours;
      top3Count++;
    } else if (!task.founderOnly && score < 20) {
      // Low-score non-founder tasks → outsource
      const delegate = findBestDelegate(task, delegates);
      result.push({
        ...task,
        status: 'outsource',
        delegateTo: delegate,
        delegationBrief: generateDelegationBrief(task, delegate),
        reasoning: 'Not founder-critical. Delegate for leverage.',
      });
    } else {
      result.push({
        ...task,
        status: 'notToday',
        reasoning:
          top3Count >= 3
            ? 'Today\'s slots are full. Focus on your top 3.'
            : 'Would exceed your deep work budget.',
      });
    }
  }

  return [...result, ...otherTasks];
}
