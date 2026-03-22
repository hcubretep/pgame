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

export default function TaskCard({ task, showActions = true }: { task: Task; showActions?: boolean }) {
  const { moveTask, getDelegationBrief } = useTaskContext();
  const [showBrief, setShowBrief] = useState(false);

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
      {showActions && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-100">
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
        </div>
      )}
    </div>
  );
}
