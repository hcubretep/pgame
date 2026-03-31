'use client';

import { useTaskContext } from '@/context/TaskContext';

export default function XpFloat() {
  const { xpGainEvent } = useTaskContext();
  if (!xpGainEvent) return null;

  return (
    <div
      key={xpGainEvent.amount + String(xpGainEvent.isBonus)}
      className="fixed bottom-24 right-6 z-50 pointer-events-none animate-xp-float"
    >
      <div className="flex items-center gap-1.5 bg-zinc-900 text-white text-sm font-semibold px-3 py-1.5 rounded-full shadow-lg">
        <span className="text-yellow-400">+{xpGainEvent.amount} XP</span>
        {xpGainEvent.isBonus && <span className="text-xs text-zinc-400">Perfect day!</span>}
      </div>
    </div>
  );
}
