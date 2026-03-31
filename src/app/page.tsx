'use client';

import { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { useSession, signIn } from 'next-auth/react';
import TaskCard from '@/components/TaskCard';
import CompletionToast from '@/components/CompletionToast';
import LevelUpScreen from '@/components/LevelUpScreen';
import XpFloat from '@/components/XpFloat';
import WeeklySnapshotCard from '@/components/WeeklySnapshot';
import { getXpProgress, BRANCHES, getBranchRank } from '@/lib/levels';

export default function Dashboard() {
  const { tasks, recalculate, recalculateWithAi, syncCalendar, syncSlack, isAiLoading, isSyncing, isSlackSyncing, isLoading, isAutoSyncing, syncProgress, aiError, settings, userStats, showCheckin, dismissCheckin, addTask, weeklySnapshot, dismissWeeklySnapshot } = useTaskContext();
  const xpProgress = getXpProgress(userStats.totalXp);
  const { data: session } = useSession();
  const [checkinText, setCheckinText] = useState('');
  const [checkinSubmitting, setCheckinSubmitting] = useState(false);

  const handleCheckinSubmit = async () => {
    const lines = checkinText.split('\n').filter((l) => l.trim());
    if (lines.length === 0) { dismissCheckin(); return; }
    setCheckinSubmitting(true);
    for (const line of lines) {
      addTask({
        title: line.trim(),
        description: 'Added from daily check-in',
        category: 'operations',
        urgency: 4,
        revenueImpact: 4,
        leverage: 4,
        founderOnly: true,
        estimatedHours: 1,
      });
    }
    dismissCheckin();
    setCheckinText('');
    // Re-prioritize after a tick so React can process the new tasks
    setTimeout(() => recalculateWithAi(), 100);
    setCheckinSubmitting(false);
  };

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

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-zinc-400">Loading your tasks...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Sync progress bar — non-blocking, shows above tasks */}
      {isAutoSyncing && syncProgress && (
        <div className="mb-6 p-3 rounded-lg bg-zinc-50 border border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="relative w-4 h-4 shrink-0">
              <div className="absolute inset-0 rounded-full border-2 border-zinc-200" />
              <div className="absolute inset-0 rounded-full border-2 border-t-zinc-900 animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-600">{syncProgress.stage}</p>
              <div className="mt-1.5 h-1 bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-900 rounded-full transition-all duration-500"
                  style={{ width: `${(syncProgress.stepsCompleted / syncProgress.totalSteps) * 100}%` }}
                />
              </div>
            </div>
            <span className="text-[10px] text-zinc-400 shrink-0">
              {syncProgress.stepsCompleted}/{syncProgress.totalSteps}
            </span>
          </div>
        </div>
      )}

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
            onClick={syncSlack}
            disabled={isSlackSyncing}
            className="text-xs px-3 py-1.5 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors disabled:opacity-50"
          >
            {isSlackSyncing ? 'Syncing...' : 'Sync Slack'}
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

      {/* XP Status Bar */}
      <div className="mb-8 flex items-center gap-3">
        <span className="text-xs font-semibold text-zinc-500 shrink-0">
          Lv.{userStats.level} · {xpProgress.current.title}
        </span>
        <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-zinc-900 rounded-full transition-all duration-500"
            style={{ width: `${xpProgress.progressPercent}%` }}
          />
        </div>
        <span className="text-[11px] text-zinc-400 shrink-0 tabular-nums">
          {userStats.totalXp.toLocaleString()} XP
          {xpProgress.next && ` / ${xpProgress.next.xpRequired.toLocaleString()}`}
        </span>
        {userStats.streakCount > 0 && (
          <span className="flex items-center gap-1 text-xs font-semibold text-orange-500 shrink-0">
            🔥 {userStats.streakCount}
          </span>
        )}
      </div>

      {/* Skill Branch Bars */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 mb-8">
        {BRANCHES.map((branch) => {
          const xp =
            branch.key === 'builder'   ? userStats.skillBuilderXp :
            branch.key === 'grower'    ? userStats.skillGrowerXp :
            branch.key === 'operator'  ? userStats.skillOperatorXp :
            userStats.skillVisionaryXp;
          const { rank, progressPercent } = getBranchRank(xp, branch);
          return (
            <div key={branch.key} className="flex items-center gap-2 min-w-0">
              <span className={`text-[10px] font-medium w-14 shrink-0 ${branch.textColor}`}>{branch.label}</span>
              <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
                <div className={`h-full ${branch.color} rounded-full transition-all duration-500`} style={{ width: `${progressPercent}%` }} />
              </div>
              <span className="text-[10px] text-zinc-400 shrink-0 w-24 truncate">{rank.title}</span>
            </div>
          );
        })}
      </div>

      {/* Weekly snapshot — Monday mornings only */}
      {weeklySnapshot && !isAutoSyncing && (
        <WeeklySnapshotCard snapshot={weeklySnapshot} onDismiss={dismissWeeklySnapshot} />
      )}

      {aiError && (
        <div className="mb-6 p-3 rounded bg-red-50 border border-red-200 text-xs text-red-700">
          {aiError}
        </div>
      )}

      {/* Daily check-in card — appears once per day after AI prioritizes */}
      {showCheckin && !isAutoSyncing && (
        <div className="mb-8 border border-zinc-200 rounded-xl p-5 bg-white shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-semibold text-zinc-900">Your top 3 are set.</p>
              <p className="text-sm text-zinc-400 mt-0.5">Anything else on your mind that should be in the mix?</p>
            </div>
            <button
              onClick={dismissCheckin}
              className="text-zinc-300 hover:text-zinc-500 transition-colors text-lg leading-none ml-4 mt-0.5"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
          <textarea
            value={checkinText}
            onChange={(e) => setCheckinText(e.target.value)}
            placeholder={"One per line, e.g.\nFollow up with investor Tom\nReview Q2 roadmap before board call"}
            className="w-full border border-zinc-200 rounded-lg p-3 text-sm text-zinc-800 placeholder-zinc-300 resize-none focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 transition-all"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2 mt-3 justify-end">
            <button
              onClick={dismissCheckin}
              className="text-xs px-3 py-1.5 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              Nothing for now
            </button>
            <button
              onClick={handleCheckinSubmit}
              disabled={checkinSubmitting}
              className="text-xs px-4 py-1.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              {checkinSubmitting ? 'Adding...' : 'Add to my day →'}
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="text-center py-16">
          {session ? (
            <>
              <p className="text-zinc-400 text-sm mb-4">No tasks yet. Pull in your week.</p>
              <button
                onClick={syncCalendar}
                disabled={isSyncing}
                className="text-sm px-4 py-2 rounded bg-zinc-900 text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                {isSyncing ? 'Syncing...' : 'Sync Google Calendar'}
              </button>
            </>
          ) : (
            <>
              <p className="text-zinc-400 text-sm mb-4">Sign in to pull your calendar and get priorities.</p>
              <button
                onClick={() => signIn('google')}
                className="text-sm px-4 py-2 rounded bg-zinc-900 text-white hover:bg-zinc-700 transition-colors"
              >
                Sign in with Google
              </button>
            </>
          )}
        </div>
      )}

      {/* Top 3 */}
      {!isEmpty && (
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-semibold text-zinc-900">Your Top 3 Today</h2>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < done.length ? 'bg-emerald-400' : 'bg-zinc-200'
                  }`}
                />
              ))}
            </div>
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

      <CompletionToast />
      <XpFloat />
      <LevelUpScreen />
    </div>
  );
}
