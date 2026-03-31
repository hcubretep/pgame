'use client';

import { WeeklySnapshot as WeeklySnapshotType } from '@/types';

const BRANCH_LABELS: Record<string, string> = {
  builder: 'Builder',
  grower: 'Grower',
  operator: 'Operator',
  visionary: 'Visionary',
};

const BRANCH_EMOJI: Record<string, string> = {
  builder: '🔨',
  grower: '📈',
  operator: '⚙️',
  visionary: '🔭',
};

interface Props {
  snapshot: WeeklySnapshotType;
  onDismiss: () => void;
}

export default function WeeklySnapshot({ snapshot, onDismiss }: Props) {
  const {
    xpEarned,
    tasksCompleted,
    perfectDays,
    workingDays,
    streakCount,
    topSkill,
    weakestSkill,
  } = snapshot;

  return (
    <div className="mb-8 border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-zinc-900 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">Last Week</span>
          {streakCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-orange-400">
              🔥 {streakCount} day streak
            </span>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm leading-none"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>

      {/* Stats grid */}
      <div className="bg-white px-5 py-4">
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          <Stat label="XP earned" value={xpEarned.toLocaleString()} unit="xp" highlight />
          <Stat label="Tasks crushed" value={String(tasksCompleted)} />
          <Stat
            label="Perfect days"
            value={`${perfectDays}/${workingDays > 0 ? workingDays : 5}`}
            unit="days"
          />
          <Stat label="Current streak" value={String(streakCount)} unit="days" />
        </div>

        {/* Skill callouts */}
        {(topSkill || weakestSkill) && (
          <div className="mt-4 pt-4 border-t border-zinc-100 space-y-2">
            {topSkill && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">
                  {BRANCH_EMOJI[topSkill.branch] || '⭐'}{' '}
                  <span className="font-medium text-zinc-700">Top skill:</span>{' '}
                  {BRANCH_LABELS[topSkill.branch] || topSkill.branch}
                </span>
                <span className="font-semibold text-emerald-600">
                  +{topSkill.xp.toLocaleString()} XP
                </span>
              </div>
            )}
            {weakestSkill && weakestSkill.branch !== topSkill?.branch && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">
                  {BRANCH_EMOJI[weakestSkill.branch] || '⚠️'}{' '}
                  <span className="font-medium text-zinc-700">Needs work:</span>{' '}
                  {BRANCH_LABELS[weakestSkill.branch] || weakestSkill.branch}
                </span>
                <span className="font-semibold text-amber-600">
                  +{weakestSkill.xp.toLocaleString()} XP
                </span>
              </div>
            )}
          </div>
        )}

        {/* Day dots */}
        {snapshot.logs.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-100">
            <p className="text-[10px] text-zinc-400 mb-2 uppercase tracking-wide">Last 7 days</p>
            <div className="flex gap-1.5">
              {snapshot.logs.map((log) => (
                <div key={log.date} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-5 h-5 rounded-full ${
                      log.top3Cleared
                        ? 'bg-emerald-400'
                        : log.tasksCompleted > 0
                        ? 'bg-zinc-300'
                        : 'bg-zinc-100'
                    }`}
                    title={`${log.date}: ${log.tasksCompleted} tasks, ${log.xpEarned} XP${log.top3Cleared ? ' ✓' : ''}`}
                  />
                  <span className="text-[9px] text-zinc-300">
                    {new Date(log.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'narrow' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-zinc-50 border-t border-zinc-100 px-5 py-3">
        <p className="text-xs text-zinc-400">
          {perfectDays >= 4
            ? '🏆 Dominant week. Keep the streak alive.'
            : perfectDays >= 2
            ? '💪 Solid week. Aim for more perfect days.'
            : "🎯 New week, clean slate. What's the #1 move today?"}
        </p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: string;
  unit?: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] text-zinc-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-lg font-bold tabular-nums ${highlight ? 'text-zinc-900' : 'text-zinc-700'}`}>
        {value}
        {unit && <span className="text-xs font-normal text-zinc-400 ml-1">{unit}</span>}
      </p>
    </div>
  );
}
