import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Task, Settings } from '@/types';

function buildBusinessContext(settings: Settings): string {
  const parts: string[] = [];

  if (settings.companyName) {
    const desc = settings.companyDescription ? ` — ${settings.companyDescription}` : '';
    parts.push(`Company: ${settings.companyName}${desc}`);
  }
  if (settings.companyStage) parts.push(`Stage: ${settings.companyStage}`);
  if (settings.currentRevenue) parts.push(`Current revenue: ${settings.currentRevenue}`);
  const goals = (settings.quarterlyGoals || []).filter((g) => g.trim());
  if (goals.length > 0) {
    parts.push(`Top quarterly goals:\n${goals.map((g, i) => `  ${i + 1}. ${g}`).join('\n')}`);
  }
  if (settings.biggestBottleneck) parts.push(`Biggest bottleneck: ${settings.biggestBottleneck}`);
  if (settings.pipelineStatus) parts.push(`Sales pipeline: ${settings.pipelineStatus}`);
  if (settings.founderSuperpower) parts.push(`Founder superpower (only they can do): ${settings.founderSuperpower}`);
  if (settings.avoidDelegate) parts.push(`Should avoid / delegate: ${settings.avoidDelegate}`);

  return parts.length > 0 ? `\nBUSINESS CONTEXT:\n${parts.join('\n')}\n` : '';
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey });
  const { tasks, settings } = (await req.json()) as { tasks: Task[]; settings: Settings };

  const activeTasks = tasks.filter((t) => t.status !== 'done');
  const doneTasks = tasks.filter((t) => t.status === 'done');
  const businessContext = buildBusinessContext(settings);

  const delegateList = settings.delegates.length > 0
    ? settings.delegates.map((d) => `${d.name} (${d.role}) — can handle: ${d.capabilities.join(', ')}`).join('\n')
    : 'No delegates configured.';

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const calendarEvents = activeTasks
    .filter((t) => t.source === 'google-calendar')
    .map((t) => `- "${t.title}" (${t.estimatedHours}h, ${t.category})${t.deadline ? ` deadline: ${t.deadline}` : ''}`)
    .join('\n');

  const manualTasks = activeTasks
    .filter((t) => t.source !== 'google-calendar')
    .map((t, i) => `[M${i}] "${t.title}" | ${t.category} | urgency:${t.urgency}/5 | revenue:${t.revenueImpact}/5 | leverage:${t.leverage}/5 | founderOnly:${t.founderOnly} | ${t.estimatedHours}h | deadline:${t.deadline || 'none'}\n    ${t.description}`)
    .join('\n');

  const prompt = `You are the ruthless chief of staff for ${settings.founderName}${settings.companyName ? `, founder of ${settings.companyName}` : ', a startup founder'}. Today is ${today}. They have ${settings.deepWorkHours} hours of deep work capacity.
${businessContext}
CALENDAR TODAY (meetings/events — these are context, not deep work):
${calendarEvents || 'No calendar events.'}

EXISTING TASKS:
${manualTasks || 'No manual tasks yet.'}

AVAILABLE DELEGATES:
${delegateList}

YOUR JOB: Based on the business context, quarterly goals, bottleneck, and pipeline — figure out what ${settings.founderName} should ACTUALLY work on today. Calendar meetings are just context (they'll happen regardless). The real question is: what should the founder do in their ${settings.deepWorkHours}h of deep work?

STEP 1: GENERATE 5-8 high-leverage strategic tasks the founder SHOULD consider today. These should come from:
- Quarterly goals that need founder action
- Pipeline deals that need founder involvement to close
- Bottleneck-breaking work
- Strategic decisions only the founder can make
- Follow-ups from today's meetings
- Revenue-generating activities
Think like a world-class chief of staff who knows the business deeply.

STEP 2: Combine generated tasks with any existing manual tasks, then select:
- TOP 3: The 3 highest-leverage founder-only tasks (total ≤ ${settings.deepWorkHours}h)
- OUTSOURCE: Tasks a delegate should handle
- NOT TODAY: Everything else

Respond with ONLY valid JSON (no markdown, no code fences):
{
  "generated_tasks": [
    {
      "title": "Short action-oriented title",
      "description": "What specifically to do and why it matters",
      "category": "sales|marketing|product|operations|finance|hiring",
      "urgency": 4,
      "revenueImpact": 5,
      "leverage": 4,
      "founderOnly": true,
      "estimatedHours": 1
    }
  ],
  "top3": [
    {
      "title": "Task title (from generated or existing)",
      "source": "generated|existing",
      "existingIndex": null,
      "reasoning": "Sharp 1-2 sentence explanation referencing business context"
    }
  ],
  "outsource": [
    {
      "title": "Task title",
      "source": "generated|existing",
      "existingIndex": null,
      "reasoning": "Why delegate this",
      "delegateTo": "Delegate name"
    }
  ],
  "notToday": [
    {
      "title": "Task title",
      "source": "generated|existing",
      "existingIndex": null,
      "reasoning": "Why defer"
    }
  ]
}

Rules:
- top3 must have exactly 3 tasks, total estimatedHours ≤ ${settings.deepWorkHours}
- Generated tasks should be SPECIFIC and ACTIONABLE (not "think about strategy" — instead "Draft pricing proposal for [specific deal]")
- Reference real business context in all reasoning
- For existing tasks, set existingIndex to the M-index number
- Be ruthless — most things should be delegated or deferred`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'Empty response from OpenAI' }, { status: 500 });
    }

    const parsed = JSON.parse(content);

    // Build the final task list
    const manualTaskList = activeTasks.filter((t) => t.source !== 'google-calendar');
    const finalTasks: Task[] = [];

    // Helper to create a task from AI-generated data
    const makeTask = (gen: { title: string; description: string; category: string; urgency: number; revenueImpact: number; leverage: number; founderOnly: boolean; estimatedHours: number }): Task => ({
      id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: gen.title,
      description: gen.description,
      category: gen.category as Task['category'],
      urgency: gen.urgency,
      revenueImpact: gen.revenueImpact,
      leverage: gen.leverage,
      founderOnly: gen.founderOnly,
      estimatedHours: gen.estimatedHours,
      status: 'inbox',
      source: 'ai-generated',
      createdAt: new Date().toISOString(),
    });

    // Map generated tasks by title for lookup
    const generatedMap = new Map<string, Task>();
    for (const gen of parsed.generated_tasks || []) {
      const task = makeTask(gen);
      generatedMap.set(gen.title, task);
    }

    // Process top3
    for (const item of parsed.top3 || []) {
      let task: Task;
      if (item.source === 'existing' && item.existingIndex != null && manualTaskList[item.existingIndex]) {
        task = { ...manualTaskList[item.existingIndex] };
      } else {
        task = generatedMap.get(item.title) || makeTask({ title: item.title, description: item.reasoning, category: 'operations', urgency: 4, revenueImpact: 4, leverage: 4, founderOnly: true, estimatedHours: 1 });
      }
      task.status = 'top3';
      task.reasoning = item.reasoning;
      finalTasks.push(task);
    }

    // Process outsource
    for (const item of parsed.outsource || []) {
      let task: Task;
      if (item.source === 'existing' && item.existingIndex != null && manualTaskList[item.existingIndex]) {
        task = { ...manualTaskList[item.existingIndex] };
      } else {
        task = generatedMap.get(item.title) || makeTask({ title: item.title, description: item.reasoning, category: 'operations', urgency: 3, revenueImpact: 3, leverage: 3, founderOnly: false, estimatedHours: 1 });
      }
      task.status = 'outsource';
      task.reasoning = item.reasoning;
      if (item.delegateTo) {
        task.delegateTo = item.delegateTo;
        task.delegationBrief = `**Task:** ${task.title}\n\n**Assigned to:** ${item.delegateTo}\n\n**Context:** ${task.description}\n\n**Why now:** ${item.reasoning}\n\n**Deadline:** ${task.deadline || 'This week.'}`;
      }
      finalTasks.push(task);
    }

    // Process notToday
    for (const item of parsed.notToday || []) {
      let task: Task;
      if (item.source === 'existing' && item.existingIndex != null && manualTaskList[item.existingIndex]) {
        task = { ...manualTaskList[item.existingIndex] };
      } else {
        task = generatedMap.get(item.title) || makeTask({ title: item.title, description: item.reasoning, category: 'operations', urgency: 2, revenueImpact: 2, leverage: 2, founderOnly: false, estimatedHours: 1 });
      }
      task.status = 'notToday';
      task.reasoning = item.reasoning;
      finalTasks.push(task);
    }

    // Keep calendar events as context (mark as notToday if not already categorized)
    const calendarTasks = activeTasks
      .filter((t) => t.source === 'google-calendar')
      .map((t) => ({ ...t, status: 'notToday' as const, reasoning: 'Calendar event — happens regardless of prioritization.' }));

    return NextResponse.json({ tasks: [...finalTasks, ...calendarTasks, ...doneTasks] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `OpenAI error: ${message}` }, { status: 500 });
  }
}
