import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';
import { Task, TaskCategory } from '@/types';

const SLACK_API = 'https://slack.com/api';
const PETER_SLACK_USER_ID = 'U1F8FM4BB';

interface SlackMessage {
  type: string;
  user?: string;
  text: string;
  ts: string;
  username?: string;
  bot_id?: string;
}

interface SlackChannel {
  id: string;
  name: string;
}

async function fetchChannelHistory(token: string, channelId: string, oldest: string): Promise<SlackMessage[]> {
  const params = new URLSearchParams({
    channel: channelId,
    oldest,
    limit: '100',
  });

  const res = await fetch(`${SLACK_API}/conversations.history?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Slack API error: ${res.status}`);
  }

  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error}`);
  }

  return data.messages || [];
}

async function fetchMentions(token: string, oldest: string): Promise<SlackMessage[]> {
  const params = new URLSearchParams({
    query: `<@${PETER_SLACK_USER_ID}>`,
    sort: 'timestamp',
    count: '50',
  });

  const res = await fetch(`${SLACK_API}/search.messages?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Slack search API error: ${res.status}`);
  }

  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Slack search API error: ${data.error}`);
  }

  const matches = data.messages?.matches || [];
  return matches
    .filter((m: { ts: string }) => parseFloat(m.ts) >= parseFloat(oldest))
    .map((m: { text: string; ts: string; user?: string; username?: string; channel?: { id: string; name: string } }) => ({
      type: 'message',
      user: m.user,
      text: m.text,
      ts: m.ts,
      username: m.username,
      _channel: m.channel?.name || 'dm',
    }));
}

async function fetchDirectMessages(token: string, oldest: string): Promise<{ channel: string; messages: SlackMessage[] }[]> {
  // List DM conversations
  const params = new URLSearchParams({
    types: 'im',
    limit: '20',
  });

  const res = await fetch(`${SLACK_API}/conversations.list?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return [];

  const data = await res.json();
  if (!data.ok) return [];

  const dmChannels = data.channels || [];
  const results: { channel: string; messages: SlackMessage[] }[] = [];

  for (const dm of dmChannels.slice(0, 10)) {
    try {
      const messages = await fetchChannelHistory(token, dm.id, oldest);
      const incomingMessages = messages.filter((m) => m.user !== PETER_SLACK_USER_ID && !m.bot_id);
      if (incomingMessages.length > 0) {
        results.push({ channel: `DM with ${dm.user || 'unknown'}`, messages: incomingMessages });
      }
    } catch {
      // Skip DMs we can't access
    }
  }

  return results;
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

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const slackToken = process.env.SLACK_USER_TOKEN;
  if (!slackToken) {
    return NextResponse.json({ error: 'SLACK_USER_TOKEN not configured. Add it to your environment variables.' }, { status: 500 });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
  }

  const { channels } = (await req.json()) as { channels: SlackChannel[] };

  if (!channels || channels.length === 0) {
    return NextResponse.json({ error: 'No Slack channels configured. Add channels in Settings.' }, { status: 400 });
  }

  try {
    // Calculate 24 hours ago as Unix timestamp
    const oldest = (Math.floor(Date.now() / 1000) - 86400).toString();

    // Fetch messages from all configured channels in parallel
    const channelPromises = channels.map(async (ch) => {
      const messages = await fetchChannelHistory(slackToken, ch.id, oldest);
      return {
        channel: `#${ch.name}`,
        messages: messages.filter((m) => !m.bot_id),
      };
    });

    // Fetch mentions and DMs in parallel with channel messages
    const [channelResults, mentions, dmResults] = await Promise.all([
      Promise.all(channelPromises),
      fetchMentions(slackToken, oldest),
      fetchDirectMessages(slackToken, oldest),
    ]);

    // Build a consolidated message dump for GPT
    const messageSections: string[] = [];

    for (const result of channelResults) {
      if (result.messages.length === 0) continue;
      const msgTexts = result.messages
        .slice(0, 50) // Limit per channel
        .map((m) => `  [${new Date(parseFloat(m.ts) * 1000).toLocaleTimeString()}] ${m.username || m.user || 'unknown'}: ${m.text}`)
        .join('\n');
      messageSections.push(`--- ${result.channel} ---\n${msgTexts}`);
    }

    if (mentions.length > 0) {
      const mentionTexts = mentions
        .slice(0, 30)
        .map((m: SlackMessage & { _channel?: string }) => `  [${new Date(parseFloat(m.ts) * 1000).toLocaleTimeString()}] ${m.username || m.user || 'unknown'} (in ${(m as SlackMessage & { _channel?: string })._channel || 'unknown'}): ${m.text}`)
        .join('\n');
      messageSections.push(`--- Mentions of Peter ---\n${mentionTexts}`);
    }

    for (const dm of dmResults) {
      if (dm.messages.length === 0) continue;
      const dmTexts = dm.messages
        .slice(0, 20)
        .map((m) => `  [${new Date(parseFloat(m.ts) * 1000).toLocaleTimeString()}] ${m.username || m.user || 'unknown'}: ${m.text}`)
        .join('\n');
      messageSections.push(`--- ${dm.channel} ---\n${dmTexts}`);
    }

    if (messageSections.length === 0) {
      return NextResponse.json({ tasks: [], message: 'No recent Slack messages found.' });
    }

    const allMessages = messageSections.join('\n\n');

    // Send to GPT to extract action items
    const openai = new OpenAI({ apiKey: openaiKey });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `You are extracting action items for Peter Buchroithner, co-founder at Gateway Labs. Look at these Slack messages from the last 24 hours and identify: tasks assigned to Peter, decisions he needs to make, follow-ups he should do, requests from team members. Return specific, actionable tasks.

SLACK MESSAGES:
${allMessages}

Extract action items and respond with ONLY valid JSON (no markdown, no code fences):
{
  "actionItems": [
    {
      "title": "Short, specific action-oriented title",
      "description": "What needs to be done and context from the conversation",
      "channel": "#channel-name or DM source",
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
- Only extract items that require action from Peter
- Be specific — "Reply to Manfred about Q1 budget" not "Check messages"
- Include context from the conversation in the description
- If no action items are found, return {"actionItems": []}
- Urgency 5 = needs response today, 1 = can wait a week
- Set founderOnly: true for decisions, strategy, key relationships`,
        },
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'Empty response from OpenAI' }, { status: 500 });
    }

    const parsed = JSON.parse(content);
    const tasks: Task[] = (parsed.actionItems || []).map(
      (item: {
        title: string;
        description: string;
        channel: string;
        category: string;
        urgency: number;
        revenueImpact: number;
        leverage: number;
        founderOnly: boolean;
        estimatedHours: number;
      }, i: number) => ({
        id: `slack_${Date.now()}_${i}`,
        title: item.title,
        description: `${item.description}\n\nSource: ${item.channel} (Slack)`,
        category: (['sales', 'marketing', 'product', 'operations', 'finance', 'hiring'].includes(item.category)
          ? item.category
          : guessCategoryFromText(item.title + ' ' + item.description)) as TaskCategory,
        urgency: Math.min(5, Math.max(1, item.urgency)),
        revenueImpact: Math.min(5, Math.max(1, item.revenueImpact)),
        leverage: Math.min(5, Math.max(1, item.leverage)),
        founderOnly: item.founderOnly,
        estimatedHours: item.estimatedHours || 0.5,
        status: 'inbox' as const,
        source: 'slack',
        slackChannel: item.channel,
        createdAt: new Date().toISOString(),
      })
    );

    return NextResponse.json({ tasks, source: 'slack' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Slack sync failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
