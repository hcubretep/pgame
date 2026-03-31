import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUserByEmail, getUserStats, awardXp } from '@/lib/db';
import { getLevelFromXp } from '@/lib/levels';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = await getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ totalXp: 0, level: 1, streakCount: 0, streakLastDate: null });

  const stats = await getUserStats(user.id);
  return NextResponse.json(stats);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = await getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { amount } = await req.json();
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  const result = await awardXp(user.id, amount);
  const levelDef = getLevelFromXp(result.newTotal);

  return NextResponse.json({
    newTotal: result.newTotal,
    newLevel: result.newLevel,
    leveledUp: result.leveledUp,
    title: levelDef.title,
  });
}
