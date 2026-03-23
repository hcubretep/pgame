import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';
import { Task, TaskCategory } from '@/types';

interface MsTodoTask {
  id: string;
  title: string;
  status: string;
  importance: string;
  body?: { content: string; contentType: string };
  dueDateTime?: { dateTime: string; timeZone: string };
  createdDateTime: string;
}

interface MsTodoList {
  id: string;
  displayName: string;
}

function guessCategoryFromText(text: string): TaskCategory {
  const lower = text.toLowerCase();
  if (lower.includes('deal') || lower.includes('pipeline') || lower.includes('prospect') || lower.includes('customer') || lower.includes('revenue')) return 'sales';
  if (lower.includes('marketing') || lower.includes('content') || lower.includes('press') || lower.includes('launch') || lower.includes('seo') || lower.includes('social')) return 'marketing';
  if (lower.includes('product') || lower.includes('feature') || lower.includes('bug') || lower.includes('dev') || lower.includes('engineering') || lower.includes('ship')) return 'product';
  if (lower.includes('hire') || lower.includes('interview') || lower.includes('candidate') || lower.includes('recruit')) return 'hiring';
  if (lower.includes('finance') || lower.includes('budget') || lower.includes('invoice') || lower.includes('investor') || lower.includes('funding')) return 'finance';
  return 'operations';
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const refreshToken = process.env.MICROSOFT_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Microsoft OAuth credentials not configured. Add MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, and MICROSOFT_REFRESH_TOKEN to your environment variables.');
  }

  const res = await fetch('https://login.microsoftonline.com/consumers/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      scope: 'https://graph.microsoft.com/Tasks.Read offline_access',
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.error || 'Failed to exchange Microsoft refresh token');
  }

  return data.access_token;
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
  }

  try {
    const accessToken = await getAccessToken();

    // Fetch all task lists
    const listsRes = await fetch('https://graph.microsoft.com/v1.0/me/todo/lists', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!listsRes.ok) {
      const err = await listsRes.json();
      throw new Error(err.error?.message || 'Failed to fetch task lists');
    }

    const listsData = await listsRes.json();
    const lists: MsTodoList[] = listsData.value || [];

    // Fetch incomplete tasks from each list
    const allTodoTasks: (MsTodoTask & { listName: string })[] = [];

    for (const list of lists) {
      const tasksRes = await fetch(
        `https://graph.microsoft.com/v1.0/me/todo/lists/${list.id}/tasks?$filter=status ne 'completed'`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!tasksRes.ok) continue;

      const tasksData = await tasksRes.json();
      const tasks: MsTodoTask[] = tasksData.value || [];
      for (const t of tasks) {
        allTodoTasks.push({ ...t, listName: list.displayName });
      }
    }

    if (allTodoTasks.length === 0) {
      return NextResponse.json({ tasks: [], source: 'ms-todo', message: 'No incomplete tasks found in Microsoft To Do.' });
    }

    // Build task summary for GPT
    const taskSummary = allTodoTasks.map((t) => {
      const due = t.dueDateTime ? ` (due: ${t.dueDateTime.dateTime})` : '';
      const body = t.body?.content ? ` — ${t.body.content.slice(0, 200)}` : '';
      return `[${t.listName}] ${t.title}${due}${body}`;
    }).join('\n');

    const openai = new OpenAI({ apiKey: openaiKey });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `You are analyzing Microsoft To Do tasks for a startup founder. Evaluate each task and assign scores for prioritization.

TASKS:
${taskSummary}

For each task, respond with ONLY valid JSON (no markdown, no code fences):
{
  "tasks": [
    {
      "title": "The task title as-is",
      "description": "Brief context or the original task description",
      "listName": "The list it came from",
      "category": "sales|marketing|product|operations|finance|hiring",
      "urgency": 1-5,
      "revenueImpact": 1-5,
      "leverage": 1-5,
      "founderOnly": true/false,
      "estimatedHours": 0.5-2
    }
  ]
}

Rules:
- Keep the original task title
- category should reflect the nature of the task
- urgency 5 = needs to be done today, 1 = can wait a week+
- revenueImpact: how much completing this affects revenue
- leverage: how much this multiplies output (1=linear, 5=unlocks others)
- founderOnly: true if only the founder can do this
- estimatedHours: realistic estimate`,
        },
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'Empty response from OpenAI' }, { status: 500 });
    }

    const parsed = JSON.parse(content);
    const tasks: Task[] = (parsed.tasks || []).map(
      (item: {
        title: string;
        description: string;
        listName: string;
        category: string;
        urgency: number;
        revenueImpact: number;
        leverage: number;
        founderOnly: boolean;
        estimatedHours: number;
      }, i: number) => {
        const matchingTodo = allTodoTasks.find((t) => t.title === item.title) || allTodoTasks[i];
        return {
          id: `mstodo_${matchingTodo?.id || `${Date.now()}_${i}`}`,
          title: item.title,
          description: `${item.description}\n\nSource: Microsoft To Do (${item.listName})`,
          category: (['sales', 'marketing', 'product', 'operations', 'finance', 'hiring'].includes(item.category)
            ? item.category
            : guessCategoryFromText(item.title + ' ' + item.description)) as TaskCategory,
          urgency: Math.min(5, Math.max(1, item.urgency)),
          revenueImpact: Math.min(5, Math.max(1, item.revenueImpact)),
          leverage: Math.min(5, Math.max(1, item.leverage)),
          founderOnly: item.founderOnly,
          estimatedHours: item.estimatedHours || 0.5,
          status: 'inbox' as const,
          source: 'ms-todo',
          createdAt: matchingTodo?.createdDateTime || new Date().toISOString(),
        };
      }
    );

    return NextResponse.json({ tasks, source: 'ms-todo' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Microsoft To Do sync failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
