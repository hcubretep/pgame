import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Settings } from '@/types';

function buildBusinessContext(settings: Settings): string {
  const parts: string[] = [];

  if (settings.companyName) {
    const desc = settings.companyDescription ? ` — ${settings.companyDescription}` : '';
    parts.push(`Company: ${settings.companyName}${desc}`);
  }
  if (settings.companyStage) parts.push(`Stage: ${settings.companyStage}`);
  if (settings.biggestBottleneck) parts.push(`Biggest bottleneck: ${settings.biggestBottleneck}`);

  return parts.length > 0 ? `\nBUSINESS CONTEXT:\n${parts.join('\n')}\n` : '';
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey });
  const { title, description, settings } = (await req.json()) as {
    title: string;
    description: string;
    settings: Settings;
  };

  const businessContext = buildBusinessContext(settings);

  const prompt = `You are an ADHD productivity coach for startup founders. Your job is to break down a task into tiny "baby steps" so small that the founder can't NOT start.
${businessContext}
TASK TO BREAK DOWN:
Title: ${title}
Description: ${description || 'No description provided.'}

Create 4-6 baby steps for this task. CRITICAL RULES:

1. The FIRST step must be RIDICULOUSLY easy — so easy it takes 1-2 minutes and requires zero willpower. Examples:
   - "Open Google Docs and type the title"
   - "Open Slack and type 'Hey'"
   - "Open a new tab and go to [relevant tool]"
   - "Write one bullet point"
   - "Copy-paste the template"
   The point is to trick the ADHD brain into starting. Make it almost laughably simple.

2. Each subsequent step should gradually increase in effort but stay small (max 15 min each).

3. Steps should be SPECIFIC and ACTIONABLE — not vague like "brainstorm ideas" but concrete like "Write 3 bullet points about why this matters to the customer."

4. Also generate one short "energy tip" for ADHD founders — something like:
   - "Put on lo-fi beats before starting"
   - "Set a 15-minute timer — you only have to do this for 15 min"
   - "Do this right after coffee while your brain is fresh"
   - "Turn your phone face-down first"
   - "Tell someone you're starting this RIGHT NOW"

Respond with ONLY valid JSON (no markdown, no code fences):
{
  "steps": [
    { "title": "Step description", "minutes": 2 },
    { "title": "Step description", "minutes": 5 }
  ],
  "energyTip": "Your energy tip here"
}

Rules:
- 4-6 steps total
- First step: 1-2 minutes, embarrassingly easy
- Each step: 1-15 minutes
- Steps should be sequential and build on each other
- Be specific to the actual task, not generic`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'Empty response from OpenAI' }, { status: 500 });
    }

    const parsed = JSON.parse(content);

    // Mark the first step
    const steps = (parsed.steps || []).map((step: { title: string; minutes: number }, i: number) => ({
      title: step.title,
      minutes: step.minutes,
      isFirst: i === 0,
    }));

    return NextResponse.json({ steps, energyTip: parsed.energyTip });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `OpenAI error: ${message}` }, { status: 500 });
  }
}
