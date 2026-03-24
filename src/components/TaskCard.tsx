'use client';

import { Task } from '@/types';
import { useTaskContext } from '@/context/TaskContext';
import { useState } from 'react';

const categoryColors: Record<string, string> = {
  sales: 'bg-blue-50 text-blue-700',
  marketing: 'bg-purple-50 text-purple-700',
  product: 'bg-green-50 text-green-700',
  operations: 'bg-amber-50 text-amber-700',
  finance: 'bg-rose-50 text-rose-700',
  hiring: 'bg-cyan-50 text-cyan-700',
};

interface BabyStep {
  title: string;
  minutes: number;
  isFirst: boolean;
}

export default function TaskCard({ task, showActions = true }: { task: Task; showActions?: boolean }) {
  const { moveTask, getDelegationBrief, settings } = useTaskContext();
  const [showBrief, setShowBrief] = useState(false);
  const [babySteps, setBabySteps] = useState<BabyStep[] | null>(null);
  const [energyTip, setEnergyTip] = useState<string | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [breakdownError, setBreakdownError] = useState<string | null>(null);
  const [showBabySteps, setShowBabySteps] = useState(false);

  const handleBreakDown = async () => {
    if (babySteps) {
      setShowBabySteps(!showBabySteps);
      return;
    }

    setIsBreakingDown(true);
    setBreakdownError(null);

    try {
      const res = await fetch('/api/baby-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          settings,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to break down task');
      }

      const data = await res.json();
      setBabySteps(data.steps);
      setEnergyTip(data.energyTip);
      setShowBabySteps(true);
    } catch (err) {
      setBreakdownError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsBreakingDown(false);
    }
  };

  const toggleStep = (index: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="border border-zinc-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${categoryColors[task.category]}`}>
              {task.category}
            </span>
            {task.founderOnly && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-900 text-white">
                founder-only
              </span>
            )}
            {task.deadline && (
              <span className="text-[11px] text-zinc-400">
                Due {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-zinc-900 mb-1">{task.title}</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">{task.description}</p>
          {task.reasoning && (
            <p className="text-xs text-zinc-400 mt-2 italic">{task.reasoning}</p>
          )}
          {task.delegateTo && (
            <div className="mt-2">
              <span className="text-xs text-zinc-500">
                Delegate to: <span className="font-medium text-zinc-700">{task.delegateTo}</span>
              </span>
              <button
                onClick={() => setShowBrief(!showBrief)}
                className="ml-2 text-xs text-blue-600 hover:text-blue-700"
              >
                {showBrief ? 'Hide brief' : 'View brief'}
              </button>
              {showBrief && (
                <pre className="mt-2 p-3 bg-zinc-50 rounded text-xs text-zinc-600 whitespace-pre-wrap font-sans">
                  {getDelegationBrief(task.id)}
                </pre>
              )}
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs text-zinc-400">{task.estimatedHours}h</span>
        </div>
      </div>

      {/* Baby Steps Section */}
      {showBabySteps && babySteps && (
        <div className="mt-3 pt-3 border-t border-zinc-100">
          {energyTip && (
            <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-100 rounded-md">
              <p className="text-[11px] text-amber-700">
                <span className="font-semibold">Energy tip:</span> {energyTip}
              </p>
            </div>
          )}
          <div className="space-y-1.5">
            {babySteps.map((step, i) => (
              <label
                key={i}
                className={`flex items-start gap-2.5 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                  step.isFirst
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-zinc-50 border border-zinc-100'
                } ${checkedSteps.has(i) ? 'opacity-50' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={checkedSteps.has(i)}
                  onChange={() => toggleStep(i)}
                  className="mt-0.5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1 min-w-0">
                  <span className={`text-xs ${checkedSteps.has(i) ? 'line-through text-zinc-400' : 'text-zinc-700'}`}>
                    {step.title}
                  </span>
                  {step.isFirst && !checkedSteps.has(i) && (
                    <span className="ml-1.5 text-[10px] font-medium text-emerald-600">
                      Start here — this takes {step.minutes} min
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-zinc-400 shrink-0 mt-0.5">{step.minutes}m</span>
              </label>
            ))}
          </div>
          {babySteps.length > 0 && checkedSteps.size === babySteps.length && (
            <div className="mt-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-md text-center">
              <p className="text-xs font-medium text-emerald-700">All steps done! Mark the task as complete?</p>
              <button
                onClick={() => moveTask(task.id, 'done')}
                className="mt-1.5 text-[11px] px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                Mark done
              </button>
            </div>
          )}
        </div>
      )}

      {breakdownError && (
        <div className="mt-2 px-3 py-2 bg-red-50 border border-red-100 rounded-md">
          <p className="text-[11px] text-red-600">{breakdownError}</p>
        </div>
      )}

      {showActions && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-zinc-100">
          {task.status !== 'top3' && (
            <button
              onClick={() => moveTask(task.id, 'top3')}
              className="text-[11px] px-2.5 py-1 rounded bg-zinc-900 text-white hover:bg-zinc-700 transition-colors"
            >
              Move to Top 3
            </button>
          )}
          {task.status !== 'notToday' && (
            <button
              onClick={() => moveTask(task.id, 'notToday')}
              className="text-[11px] px-2.5 py-1 rounded bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
            >
              Not today
            </button>
          )}
          {task.status !== 'outsource' && (
            <button
              onClick={() => moveTask(task.id, 'outsource')}
              className="text-[11px] px-2.5 py-1 rounded bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
            >
              Outsource
            </button>
          )}
          {task.status !== 'done' && (
            <button
              onClick={() => moveTask(task.id, 'done')}
              className="text-[11px] px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              Done
            </button>
          )}
          <button
            onClick={handleBreakDown}
            disabled={isBreakingDown}
            className="text-[11px] px-2.5 py-1 rounded bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors disabled:opacity-50"
          >
            {isBreakingDown ? 'Breaking down...' : babySteps ? (showBabySteps ? 'Hide steps' : 'Show steps') : 'Break it down'}
          </button>
        </div>
      )}
    </div>
  );
}
