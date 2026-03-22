import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Task, Settings } from '@/types';

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey });
  const { tasks, settings } = (await req.json()) as { tasks: Task[]; settings: Settings };

  const inboxTasks = tasks.filter((t) => t.status === 'inbox' || t.status === 'top3' || t.status === 'notToday' || t.status === 'outsource');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  if (inboxTasks.length === 0) {
    return NextResponse.json({ tasks: doneTasks });
  }

  const delegateList = settings.delegates.map((d) => `${d.name} (${d.role}) — can handle: ${d.capabilities.join(', ')}`).join('\n');

  const taskList = inboxTasks
    .map(
      (t, i) =>
        `[${i}] "${t.title}" | ${t.category} | urgency:${t.urgency}/5 | revenue:${t.revenueImpact}/5 | leverage:${t.leverage}/5 | founderOnly:${t.founderOnly} | ${t.estimatedHours}h | deadline:${t.deadline || 'none'}\n    Description: ${t.description}`
    )
    .join('\n');

  const prompt = `You are a ruthless chief of staff for ${settings.founderName}, a startup founder with only ${settings.deepWorkHours} hours of deep work per day.

Your job: look at all pending tasks and decide:
1. TOP 3 — the 3 most important tasks that ONLY the founder should do today, fitting within ${settings.deepWorkHours}h total
2. NOT TODAY — tasks that matter but should wait
3. OUTSOURCE — tasks someone else should handle

Optimize for: revenue, leverage, urgency, strategic movement, and founder-only work.
Be ruthless. If it's not founder-critical, delegate it. If it doesn't move the needle today, defer it.

AVAILABLE DELEGATES:
${delegateList}

PENDING TASKS:
${taskList}

Respond with ONLY valid JSON in this exact format (no markdown, no code fences):
{
  "decisions": [
    {
      "index": 0,
      "status": "top3",
      "reasoning": "Why this is a top priority today",
      "delegateTo": null
    },
    {
      "index": 1,
      "status": "outsource",
      "reasoning": "Why delegate this",
      "delegateTo": "Name of delegate"
    }
  ]
}

Rules:
- status must be one of: "top3", "notToday", "outsource"
- Maximum 3 tasks as "top3", and their total estimatedHours must be <= ${settings.deepWorkHours}
- For "outsource" tasks, pick the best delegate from the list above
- delegateTo is null for top3 and notToday
- Give sharp, specific reasoning (1-2 sentences) — no fluff`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'Empty response from OpenAI' }, { status: 500 });
    }

    const parsed = JSON.parse(content);
    const decisions: Array<{
      index: number;
      status: 'top3' | 'notToday' | 'outsource';
      reasoning: string;
      delegateTo: string | null;
    }> = parsed.decisions;

    const updatedTasks = inboxTasks.map((task, i) => {
      const decision = decisions.find((d) => d.index === i);
      if (!decision) return { ...task, status: 'notToday' as const, reasoning: 'Not evaluated by AI.' };

      const updated: Task = {
        ...task,
        status: decision.status,
        reasoning: decision.reasoning,
      };

      if (decision.status === 'outsource' && decision.delegateTo) {
        updated.delegateTo = decision.delegateTo;
        updated.delegationBrief = `**Task:** ${task.title}\n\n**Assigned to:** ${decision.delegateTo}\n\n**Context:** ${task.description}\n\n**Category:** ${task.category}\n\n**Urgency:** ${task.urgency}/5 | **Revenue Impact:** ${task.revenueImpact}/5\n\n**Expected output:** Complete this task and report back with results.\n\n**Deadline:** ${task.deadline || 'No hard deadline — aim for this week.'}`;
      }

      return updated;
    });

    return NextResponse.json({ tasks: [...updatedTasks, ...doneTasks] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `OpenAI error: ${message}` }, { status: 500 });
  }
}
