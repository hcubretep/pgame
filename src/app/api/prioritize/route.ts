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

  const slackTasks = activeTasks
    .filter((t) => t.source === 'slack')
    .map((t) => `- "${t.title}" [from #${t.slackChannel || 'unknown'}]: ${t.description}`)
    .join('\n');

  const manualTasks = activeTasks
    .filter((t) => t.source !== 'google-calendar' && t.source !== 'slack')
    .map((t, i) => `[M${i}] "${t.title}" | ${t.category} | urgency:${t.urgency}/5 | revenue:${t.revenueImpact}/5 | leverage:${t.leverage}/5 | founderOnly:${t.founderOnly} | ${t.estimatedHours}h | deadline:${t.deadline || 'none'}\n    ${t.description}`)
    .join('\n');

  const prompt = `You are the ruthless chief of staff for ${settings.founderName}${settings.companyName ? `, founder of ${settings.companyName}` : ', a startup founder'}. Today is ${today}. They have ${settings.deepWorkHours} hours of deep work capacity.
${businessContext}
CALENDAR TODAY (meetings/events — these happen regardless, use as context):
${calendarEvents || 'No calendar events.'}

SLACK ACTION ITEMS (real requests from team — these need responses):
${slackTasks || 'No Slack action items.'}

EXISTING TASKS:
${manualTasks || 'No manual tasks yet.'}

AVAILABLE DELEGATES:
${delegateList}

YOUR JOB: Based on business context, quarterly goals, bottleneck, pipeline, calendar, AND Slack action items — figure out what ${settings.founderName} should ACTUALLY work on today.

Calendar meetings are context (they happen regardless). Slack items are real team requests that need action. The real question is: what should the founder do in their ${settings.deepWorkHours}h of deep work?

STEP 1: GENERATE 5-8 high-leverage strategic tasks the founder SHOULD consider today. These should come from:
- Quarterly goals that need founder action
- Pipeline deals that need founder involvement to close
- Bottleneck-breaking work
- Strategic decisions only the founder can make
- Follow-ups from today's meetings
- Slack requests that only the founder can handle
- Revenue-generating activities
Think like a world-class chief of staff who knows the business deeply.

STEP 2: Combine generated tasks with existing manual tasks AND relevant Slack action items, then select:
- TOP 3: The 3 highest-leverage founder-only tasks (total ≤ ${settings.deepWorkHours}h)
- OUTSOURCE: Tasks a delegate should handle (including Slack items that don't need founder)
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
      "title": "Task title (from generated, existing, or slack)",
      "source": "generated|existing|slack",
      "existingIndex": null,
      "reasoning": "Sharp 1-2 sentence explanation referencing business context"
    }
  ],
  "outsource": [
    {
      "title": "Task title",
      "source": "generated|existing|slack",
      "existingIndex": null,
      "reasoning": "Why delegate this",
      "delegateTo": "Delegate name"
    }
  ],
  "notToday": [
    {
      "title": "Task title",
      "source": "generated|existing|slack",
      "existingIndex": null,
      "reasoning": "Why defer"
    }
  ]
}

Rules:
- top3 must have exactly 3 tasks, total estimatedHours ≤ ${settings.deepWorkHours}
- EVERY generated task must appear in exactly one of: top3, outsource, or notToday — no task should be missing
- outsource and notToday should each have at least 2-3 tasks
- Generated tasks should be SPECIFIC and ACTIONABLE (not vague — use real names, deals, channels from the context)
- Slack action items from team members should be weighed seriously — they represent live operational needs
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

    const manualTaskList = activeTasks.filter((t) => t.source !== 'google-calendar' && t.source !== 'slack');
    const finalTasks: Task[] = [];

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

    const generatedMap = new Map<string, Task>();
    for (const gen of parsed.generated_tasks || []) {
      const task = makeTask(gen);
      generatedMap.set(gen.title, task);
    }

    // Find slack tasks by title
    const slackTaskList = activeTasks.filter((t) => t.source === 'slack');

    const resolveTask = (item: { title: string; source: string; existingIndex?: number | null }, fallbackCategory: string, fallbackScores: { urgency: number; revenueImpact: number; leverage: number; founderOnly: boolean }): Task => {
      if (item.source === 'existing' && item.existingIndex != null && manualTaskList[item.existingIndex]) {
        return { ...manualTaskList[item.existingIndex] };
      }
      if (item.source === 'slack') {
        const found = slackTaskList.find((t) => t.title.toLowerCase().includes(item.title.toLowerCase().slice(0, 20)) || item.title.toLowerCase().includes(t.title.toLowerCase().slice(0, 20)));
        if (found) return { ...found };
      }
      return generatedMap.get(item.title) || makeTask({
        title: item.title,
        description: '',
        category: fallbackCategory,
        ...fallbackScores,
        estimatedHours: 1,
      });
    };

    for (const item of parsed.top3 || []) {
      const task = resolveTask(item, 'operations', { urgency: 4, revenueImpact: 4, leverage: 4, founderOnly: true });
      task.status = 'top3';
      task.reasoning = item.reasoning;
      finalTasks.push(task);
    }

    for (const item of parsed.outsource || []) {
      const task = resolveTask(item, 'operations', { urgency: 3, revenueImpact: 3, leverage: 3, founderOnly: false });
      task.status = 'outsource';
      task.reasoning = item.reasoning;
      if (item.delegateTo) {
        task.delegateTo = item.delegateTo;
        task.delegationBrief = `**Task:** ${task.title}\n\n**Assigned to:** ${item.delegateTo}\n\n**Context:** ${task.description}\n\n**Why now:** ${item.reasoning}\n\n**Deadline:** ${task.deadline || 'This week.'}`;
      }
      finalTasks.push(task);
    }

    for (const item of parsed.notToday || []) {
      const task = resolveTask(item, 'operations', { urgency: 2, revenueImpact: 2, leverage: 2, founderOnly: false });
      task.status = 'notToday';
      task.reasoning = item.reasoning;
      finalTasks.push(task);
    }

    // Catch any generated tasks that GPT didn't categorize
    const usedTitles = new Set(finalTasks.map((t) => t.title));
    for (const [title, task] of generatedMap) {
      if (!usedTitles.has(title)) {
        task.status = 'notToday';
        task.reasoning = 'Generated but not prioritized — consider for another day.';
        finalTasks.push(task);
      }
    }

    // Add any uncategorized Slack tasks
    const usedSlackTitles = new Set(finalTasks.filter(t => t.source === 'slack').map(t => t.title.toLowerCase().slice(0, 20)));
    for (const st of slackTaskList) {
      const prefix = st.title.toLowerCase().slice(0, 20);
      if (!usedSlackTitles.has(prefix)) {
        finalTasks.push({ ...st, status: 'notToday', reasoning: 'Slack action item — not prioritized for today.' });
      }
    }

    // Keep calendar events as context
    const calendarTasks = activeTasks
      .filter((t) => t.source === 'google-calendar')
      .map((t) => ({ ...t, status: 'notToday' as const, reasoning: 'Calendar event — happens regardless of prioritization.' }));

    return NextResponse.json({ tasks: [...finalTasks, ...calendarTasks, ...doneTasks] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `OpenAI error: ${message}` }, { status: 500 });
  }
}
