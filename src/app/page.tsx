'use client';

import { useTaskContext } from '@/context/TaskContext';
import TaskCard from '@/components/TaskCard';

export default function Dashboard() {
  const { tasks, recalculate, recalculateWithAi, syncCalendar, isAiLoading, isSyncing, aiError, settings } = useTaskContext();

  const top3 = tasks.filter((t) => t.status === 'top3');
  const notToday = tasks.filter((t) => t.status === 'notToday');
  const outsource = tasks.filter((t) => t.status === 'outsource');
  const done = tasks.filter((t) => t.status === 'done');

  const totalHours = top3.reduce((sum, t) => sum + t.estimatedHours, 0);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const isEmpty = tasks.length === 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs text-zinc-400 mb-1">{today}</p>
          <h1 className="text-xl font-semibold">
            Good morning, {settings.founderName}.
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            You have {settings.deepWorkHours}h of deep work. Use them on what only you can do.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={syncCalendar}
            disabled={isSyncing}
            className="text-xs px-3 py-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            {isSyncing ? 'Syncing...' : 'Sync Calendar'}
          </button>
          <button
            onClick={recalculate}
            className="text-xs px-3 py-1.5 rounded bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
          >
            Local
          </button>
          <button
            onClick={recalculateWithAi}
            disabled={isAiLoading}
            className="text-xs px-3 py-1.5 rounded bg-zinc-900 text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            {isAiLoading ? 'Thinking...' : 'AI Prioritize'}
          </button>
        </div>
      </div>

      {aiError && (
        <div className="mb-6 p-3 rounded bg-red-50 border border-red-200 text-xs text-red-700">
          {aiError}
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="text-center py-16">
          <p className="text-zinc-400 text-sm mb-4">No tasks yet. Pull in your week.</p>
          <button
            onClick={syncCalendar}
            disabled={isSyncing}
            className="text-sm px-4 py-2 rounded bg-zinc-900 text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            {isSyncing ? 'Syncing...' : 'Sync Google Calendar'}
          </button>
        </div>
      )}

      {/* Top 3 */}
      {!isEmpty && (
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-semibold text-zinc-900">Your Top 3 Today</h2>
            <span className="text-xs text-zinc-400">
              {totalHours}h / {settings.deepWorkHours}h budget
            </span>
          </div>
          {top3.length === 0 ? (
            <p className="text-sm text-zinc-400">No priorities set. Hit AI Prioritize or add tasks.</p>
          ) : (
            <div className="space-y-3">
              {top3.map((task, i) => (
                <div key={task.id} className="flex gap-3 items-start">
                  <span className="text-lg font-bold text-zinc-300 mt-3 w-6 text-right shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <TaskCard task={task} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Not Today */}
      {notToday.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">
            Not Today
            <span className="font-normal text-zinc-400 ml-2">— resist the urge</span>
          </h2>
          <div className="space-y-3">
            {notToday.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      )}

      {/* Outsource */}
      {outsource.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">
            Outsource / Delegate
            <span className="font-normal text-zinc-400 ml-2">— let go</span>
          </h2>
          <div className="space-y-3">
            {outsource.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      )}

      {/* Done */}
      {done.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">
            Done
          </h2>
          <div className="space-y-3 opacity-50">
            {done.map((task) => (
              <TaskCard key={task.id} task={task} showActions={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
