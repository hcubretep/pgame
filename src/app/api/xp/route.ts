import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUserByEmail, getUserStats, awardXp, updateStreak } from '@/lib/db';
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

  const { amount, perfectDay } = await req.json();
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  // On a perfect day (all Top 3 cleared), update streak and add streak bonus XP
  let streakCount: number | null = null;
  let streakBonus = 0;
  if (perfectDay) {
    const streak = await updateStreak(user.id);
    streakCount = streak.newStreak;
    streakBonus = streak.bonusXp;
  }

  const result = await awardXp(user.id, amount + streakBonus);
  const levelDef = getLevelFromXp(result.newTotal);

  return NextResponse.json({
    newTotal: result.newTotal,
    newLevel: result.newLevel,
    leveledUp: result.leveledUp,
    title: levelDef.title,
    streakCount,
    streakBonus,
  });
}
