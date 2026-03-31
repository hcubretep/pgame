'use client';

import { useTaskContext } from '@/context/TaskContext';
import { getXpProgress } from '@/lib/levels';

export default function LevelUpScreen() {
  const { levelUpEvent, dismissLevelUp } = useTaskContext();
  if (!levelUpEvent) return null;

  const { current, next, progressXp, neededXp, progressPercent } = getXpProgress(levelUpEvent.totalXp);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm"
      onClick={dismissLevelUp}
    >
      <div
        className="relative bg-white rounded-2xl p-10 max-w-sm w-full mx-4 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-2xl ring-2 ring-yellow-400/40 pointer-events-none" />

        <p className="text-xs font-semibold tracking-widest text-yellow-500 uppercase mb-3">Level Up</p>

        <div className="text-8xl font-black text-zinc-900 leading-none mb-2">
          {levelUpEvent.newLevel}
        </div>

        <h2 className="text-xl font-semibold text-zinc-800 mb-1">{levelUpEvent.title}</h2>
        <p className="text-sm text-zinc-400 mb-8">{levelUpEvent.totalXp.toLocaleString()} XP total</p>

        {/* Progress to next level */}
        {next && (
          <div className="mb-8">
            <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
              <span>{current.title}</span>
              <span>{next.title}</span>
            </div>
            <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-zinc-400 mt-1.5 text-right">
              {progressXp.toLocaleString()} / {neededXp.toLocaleString()} XP to Level {next.level}
            </p>
          </div>
        )}

        <button
          onClick={dismissLevelUp}
          className="w-full py-3 rounded-xl bg-zinc-900 text-white font-semibold hover:bg-zinc-700 transition-colors"
        >
          Keep going
        </button>
      </div>
    </div>
  );
}
