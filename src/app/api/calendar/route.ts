import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Task } from '@/types';

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

async function fetchCalendarEvents(accessToken: string, calendarId: string, timeMin: string, timeMax: string) {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
  });

  const res = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    throw new Error(`Google Calendar API error: ${res.status}`);
  }

  return res.json();
}

function isPersonalBlock(summary: string): boolean {
  const lower = summary.toLowerCase();
  return (
    lower.includes('lunch') ||
    lower.includes('walk break') ||
    lower.includes('artist date') ||
    lower.includes('workout') ||
    lower.includes('gym') ||
    lower.includes('meditation')
  );
}

interface CalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  attendees?: Array<{ email: string; displayName?: string; responseStatus?: string }>;
  organizer?: { email: string; displayName?: string; self?: boolean };
  status: string;
}

function eventToTask(event: CalendarEvent): Task | null {
  const summary = event.summary || 'Untitled event';

  // Skip cancelled events
  if (event.status === 'cancelled') return null;

  // Skip personal/wellness blocks — these are not work tasks
  if (isPersonalBlock(summary)) return null;

  const startTime = event.start.dateTime || event.start.date || '';
  const endTime = event.end.dateTime || event.end.date || '';

  // Calculate duration in hours
  let estimatedHours = 0.5;
  if (event.start.dateTime && event.end.dateTime) {
    const diffMs = new Date(endTime).getTime() - new Date(startTime).getTime();
    estimatedHours = Math.round((diffMs / (1000 * 60 * 60)) * 4) / 4; // round to nearest 0.25
  }

  const hasExternalAttendees = event.attendees?.some(
    (a) => !a.email.includes('findableapp.com') && a.responseStatus !== 'declined'
  );

  const description = [
    event.description ? event.description.slice(0, 300) : '',
    event.location ? `Location: ${event.location}` : '',
    startTime ? `Time: ${new Date(startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Europe/Vienna' })}` : '',
    event.attendees?.length ? `Attendees: ${event.attendees.map((a) => a.displayName || a.email).join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    id: `gcal_${event.id}`,
    title: summary,
    description,
    category: guessCategoryFromEvent(summary, event.description || ''),
    urgency: hasExternalAttendees ? 4 : 3,
    revenueImpact: guessSalesRelevance(summary, event.description || ''),
    leverage: hasExternalAttendees ? 3 : 2,
    founderOnly: hasExternalAttendees || summary.toLowerCase().includes('pitch'),
    estimatedHours,
    deadline: startTime.split('T')[0],
    status: 'inbox',
    createdAt: new Date().toISOString(),
    reasoning: 'Imported from Google Calendar',
  };
}

function guessCategoryFromEvent(summary: string, description: string): Task['category'] {
  const text = `${summary} ${description}`.toLowerCase();
  if (text.includes('pitch') || text.includes('demo') || text.includes('deal') || text.includes('prospect')) return 'sales';
  if (text.includes('marketing') || text.includes('seo') || text.includes('content') || text.includes('linkedin')) return 'marketing';
  if (text.includes('product') || text.includes('sprint') || text.includes('engineering') || text.includes('dev')) return 'product';
  if (text.includes('hiring') || text.includes('interview') || text.includes('candidate')) return 'hiring';
  if (text.includes('investor') || text.includes('finance') || text.includes('budget')) return 'finance';
  return 'operations';
}

function guessSalesRelevance(summary: string, description: string): number {
  const text = `${summary} ${description}`.toLowerCase();
  if (text.includes('pitch') || text.includes('deal') || text.includes('close') || text.includes('prospect')) return 5;
  if (text.includes('demo') || text.includes('seo') || text.includes('marketing')) return 4;
  if (text.includes('partner') || text.includes('investor')) return 3;
  return 2;
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  const googleToken = process.env.GOOGLE_ACCESS_TOKEN;

  // If no Google token, use GPT to generate realistic tasks from calendar context
  if (!googleToken) {
    // Fallback: generate tasks based on known context
    return await generateTasksFromContext(apiKey);
  }

  try {
    const { calendarId = 'primary' } = await req.json();

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(todayStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const data = await fetchCalendarEvents(
      googleToken,
      calendarId,
      todayStart.toISOString(),
      weekEnd.toISOString()
    );

    const tasks: Task[] = (data.items || [])
      .map((event: CalendarEvent) => eventToTask(event))
      .filter((t: Task | null): t is Task => t !== null);

    return NextResponse.json({ tasks });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Calendar sync failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function generateTasksFromContext(apiKey: string | undefined) {
  if (!apiKey) {
    return NextResponse.json({ error: 'Neither GOOGLE_ACCESS_TOKEN nor OPENAI_API_KEY configured' }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey });

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `You are generating realistic tasks for Peter Buchroithner, Co-Founder & CEO of Findable (findableapp.com), an AI SEO startup based in Vienna, Austria.

Today is ${today}. Generate 6-8 realistic founder tasks for this week based on what a startup CEO running an AI/SEO product company would actually need to do. Mix of sales, marketing, product, operations.

Respond with ONLY valid JSON (no markdown, no code fences):
{
  "tasks": [
    {
      "title": "Task title",
      "description": "1-2 sentence context",
      "category": "sales|marketing|product|operations|finance|hiring",
      "urgency": 1-5,
      "revenueImpact": 1-5,
      "leverage": 1-5,
      "founderOnly": true/false,
      "estimatedHours": 0.5-3,
      "deadline": "YYYY-MM-DD or null"
    }
  ]
}`,
      },
    ],
    temperature: 0.7,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    return NextResponse.json({ error: 'Empty response from OpenAI' }, { status: 500 });
  }

  const parsed = JSON.parse(content);
  const tasks: Task[] = parsed.tasks.map((t: Omit<Task, 'id' | 'createdAt' | 'status'>, i: number) => ({
    ...t,
    id: `ai_${Date.now()}_${i}`,
    status: 'inbox',
    createdAt: new Date().toISOString(),
  }));

  return NextResponse.json({ tasks, source: 'ai-generated' });
}
