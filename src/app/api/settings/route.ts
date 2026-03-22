import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUserByEmail, getSettings, saveSettings } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = await getUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ settings: { founderName: 'Founder', deepWorkHours: 3, delegates: [], companyName: '', companyDescription: '', companyStage: '', currentRevenue: '', quarterlyGoals: ['', '', ''], biggestBottleneck: '', pipelineStatus: '', founderSuperpower: '', avoidDelegate: '', slackChannels: [{ id: 'C0A9HBGVADP', name: 'straion-marketing' }, { id: 'G1GAGFVEW', name: 'founders' }] } });
  }

  const settings = await getSettings(user.id);
  return NextResponse.json({ settings });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = await getUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { settings } = await req.json();
  await saveSettings(user.id, settings);
  return NextResponse.json({ ok: true });
}
