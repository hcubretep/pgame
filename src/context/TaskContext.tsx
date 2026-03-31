'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { Task, Settings, UserStats, WeeklySnapshot } from '@/types';
import { prioritizeTasks, generateDelegationBrief, findBestDelegate } from '@/lib/scoring';
import { XP_AWARDS, getLevelFromXp } from '@/lib/levels';

interface CompletionEvent {
  count: number;
  total: number;
  message: string;
}

interface SyncProgress {
  stage: string;
  stepsCompleted: number;
  totalSteps: number;
}

interface XpGainEvent {
  amount: number;
  isBonus: boolean;
  streakCount: number | null;
}

interface LevelUpEvent {
  newLevel: number;
  title: string;
  totalXp: number;
}

interface TaskContextType {
  tasks: Task[];
  settings: Settings;
  userStats: UserStats;
  isAiLoading: boolean;
  isSyncing: boolean;
  isLoading: boolean;
  isAutoSyncing: boolean;
  syncProgress: SyncProgress | null;
  aiError: string | null;
  completionEvent: CompletionEvent | null;
  xpGainEvent: XpGainEvent | null;
  levelUpEvent: LevelUpEvent | null;
  dismissLevelUp: () => void;
  showCheckin: boolean;
  dismissCheckin: () => void;
  weeklySnapshot: WeeklySnapshot | null;
  dismissWeeklySnapshot: () => void;
  recalculate: () => void;
  recalculateWithAi: () => Promise<void>;
  syncCalendar: () => Promise<void>;
  syncSlack: () => Promise<void>;
  syncMsTodo: () => Promise<void>;
  isSlackSyncing: boolean;
  isMsTodoSyncing: boolean;
  moveTask: (taskId: string, newStatus: Task['status']) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  getDelegationBrief: (taskId: string) => string;
}

const defaultSettings: Settings = {
  founderName: 'Founder',
  deepWorkHours: 3,
  delegates: [],
  companyName: '',
  companyDescription: '',
  companyStage: '',
  currentRevenue: '',
  quarterlyGoals: ['', '', ''],
  biggestBottleneck: '',
  pipelineStatus: '',
  founderSuperpower: '',
  avoidDelegate: '',
  slackChannels: [
    { id: 'C0A9HBGVADP', name: 'straion-marketing' },
    { id: 'G1GAGFVEW', name: 'founders' },
  ],
};

const SYNC_STALE_MS = 24 * 60 * 60 * 1000; // 24 hours — calendar/slack sync once per day
const LAST_SYNC_KEY = 'pgame_last_sync';
const LAST_CHECKIN_KEY = 'pgame_last_checkin'; // tracks daily check-in
const LAST_SNAPSHOT_KEY = 'pgame_last_snapshot'; // tracks weekly snapshot dismissal

const TaskContext = createContext<TaskContextType | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const { data: session, status: authStatus } = useSession();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSlackSyncing, setIsSlackSyncing] = useState(false);
  const [isMsTodoSyncing, setIsMsTodoSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [completionEvent, setCompletionEvent] = useState<CompletionEvent | null>(null);
  const [showCheckin, setShowCheckin] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({ totalXp: 0, level: 1, streakCount: 0, streakLastDate: null, skillBuilderXp: 0, skillGrowerXp: 0, skillOperatorXp: 0, skillVisionaryXp: 0 });
  const [xpGainEvent, setXpGainEvent] = useState<XpGainEvent | null>(null);
  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEvent | null>(null);
  const [weeklySnapshot, setWeeklySnapshot] = useState<WeeklySnapshot | null>(null);
  const xpTimerRef = useRef<NodeJS.Timeout | null>(null);
  const completionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoSynced = useRef(false);
  // Track which user's data is loaded — prevents re-loading on OAuth token refresh
  const loadedForEmail = useRef<string | null>(null);

  // Load tasks and settings from DB on auth
  useEffect(() => {
    if (authStatus === 'loading') return;
    if (!session) {
      // User signed out — clear state and reset load tracking
      loadedForEmail.current = null;
      hasAutoSynced.current = false;
      setIsLoading(false);
      setTasks([]);
      setSettings(defaultSettings);
      return;
    }

    // Skip re-running if we already loaded for this user in this session.
    // This prevents loadData from firing again when NextAuth refreshes the
    // OAuth access token (which changes the session object reference).
    const email = session.user?.email;
    if (loadedForEmail.current === email) return;
    loadedForEmail.current = email || null;

    const currentSession = session;
    async function loadData() {
      let loadedTasks: Task[] = [];
      try {
        const [tasksRes, settingsRes, xpRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/settings'),
          fetch('/api/xp'),
        ]);

        if (tasksRes.ok) {
          const { tasks: dbTasks } = await tasksRes.json();
          loadedTasks = dbTasks || [];
          // Only update state if DB returned tasks, OR if memory is already empty.
          // This prevents a failed/empty DB response from wiping tasks already in memory.
          setTasks((prev) => (loadedTasks.length > 0 || prev.length === 0) ? loadedTasks : prev);
        }

        if (settingsRes.ok) {
          const { settings: dbSettings } = await settingsRes.json();
          if (dbSettings) {
            if (dbSettings.founderName === 'Founder' && currentSession?.user?.name) {
              dbSettings.founderName = currentSession.user.name.split(' ')[0];
            }
            setSettings(dbSettings);
          } else if (currentSession?.user?.name) {
            setSettings((prev) => ({ ...prev, founderName: currentSession.user?.name || prev.founderName }));
          }
        }

        if (xpRes.ok) {
          const stats = await xpRes.json();
          setUserStats(stats);
        }

        // Show weekly snapshot on Mondays, once per week
        const isMonday = new Date().getDay() === 1;
        const lastSnapshot = localStorage.getItem(LAST_SNAPSHOT_KEY);
        const thisMonday = (() => {
          const d = new Date();
          d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
          return d.toISOString().split('T')[0];
        })();
        if (isMonday && lastSnapshot !== thisMonday) {
          try {
            const snapRes = await fetch('/api/weekly-snapshot');
            if (snapRes.ok) {
              const snap = await snapRes.json();
              // Only show if there was actual activity last week
              if (snap.xpEarned > 0 || snap.tasksCompleted > 0) {
                setWeeklySnapshot(snap);
              }
            }
          } catch (e) {
            console.error('Failed to load weekly snapshot:', e);
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setIsLoading(false);
      }

      // On every load: run AI prioritize to keep priorities fresh.
      // Calendar/Slack sync runs at most once per 24h.
      if (!hasAutoSynced.current && currentSession) {
        hasAutoSynced.current = true;
        setIsAutoSyncing(true);

        const lastSync = localStorage.getItem(LAST_SYNC_KEY);
        const lastSyncTime = lastSync ? parseInt(lastSync, 10) : 0;
        const isStale = Date.now() - lastSyncTime > SYNC_STALE_MS;
        const isEmpty = loadedTasks.length === 0;
        const recentlySynced = Date.now() - lastSyncTime < 60 * 60 * 1000 && lastSyncTime > 0;
        const needsFullSync = (isStale || isEmpty) && !recentlySynced;

        // Helper to merge synced tasks into current state
        const mergeTasks = (current: Task[], newTasks: Task[], prefix: string): Task[] => {
          const kept = current.filter((t) => !t.id.startsWith(prefix));
          return [...kept, ...newTasks];
        };

        let currentTasks = [...loadedTasks];

        if (needsFullSync) {
          // Step 1: Calendar
          setSyncProgress({ stage: 'Syncing calendar...', stepsCompleted: 0, totalSteps: 4 });
          try {
            const r = await fetch('/api/calendar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ calendarId: 'primary' }),
            });
            if (r.ok) {
              const d = await r.json();
              currentTasks = mergeTasks(currentTasks, (d.tasks || []) as Task[], 'gcal_');
              setTasks(currentTasks);
            }
          } catch (e) { console.error('Calendar sync failed:', e); }

          // Step 2: Slack
          setSyncProgress({ stage: 'Syncing Slack...', stepsCompleted: 1, totalSteps: 4 });
          try {
            const r = await fetch('/api/slack-sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ channels: defaultSettings.slackChannels }),
            });
            if (r.ok) {
              const d = await r.json();
              currentTasks = mergeTasks(currentTasks, (d.tasks || []) as Task[], 'slack_');
              setTasks(currentTasks);
            }
          } catch (e) { console.error('Slack sync failed:', e); }

          // Step 3: MS Todo
          setSyncProgress({ stage: 'Syncing To Do...', stepsCompleted: 2, totalSteps: 4 });
          try {
            const r = await fetch('/api/ms-todo', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            });
            if (r.ok) {
              const d = await r.json();
              currentTasks = mergeTasks(currentTasks, (d.tasks || []) as Task[], 'mstodo_');
              setTasks(currentTasks);
            }
          } catch (e) { console.error('MS Todo sync failed:', e); }

          localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
        }

        // AI Prioritize — runs on EVERY load to keep priorities fresh
        // Reset all active tasks to inbox so AI re-evaluates with today's context
        if (currentTasks.filter((t) => t.status !== 'done').length > 0) {
          setSyncProgress({ stage: 'AI is setting your priorities...', stepsCompleted: 3, totalSteps: 4 });
          try {
            const tasksForAi = currentTasks.map((t) =>
              t.status === 'done' ? t : { ...t, status: 'inbox' as const }
            );
            const sentTaskIds = new Set(currentTasks.map((t) => t.id));

            const aiRes = await fetch('/api/prioritize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tasks: tasksForAi, settings: defaultSettings }),
            });
            if (aiRes.ok) {
              const aiData = await aiRes.json();
              setTasks((prev) => {
                const addedDuringSync = prev.filter((t) => !sentTaskIds.has(t.id));
                const merged = [...aiData.tasks, ...addedDuringSync];
                currentTasks = merged;
                return merged;
              });
              await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tasks: aiData.tasks }),
              });
            }
          } catch (e) { console.error('AI prioritization failed:', e); }
        }

        // Show daily check-in once per day, after AI is done
        const lastCheckin = localStorage.getItem(LAST_CHECKIN_KEY);
        const todayStr = new Date().toDateString();
        if (lastCheckin !== todayStr && currentTasks.filter((t) => t.status !== 'done').length > 0) {
          setShowCheckin(true);
        }

        setSyncProgress(null);
        setIsAutoSyncing(false);
      }
    }

    loadData();
  }, [session, authStatus]);

  // Save tasks to DB
  const persistTasks = useCallback(async (newTasks: Task[]) => {
    if (!session) return;
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: newTasks }),
      });
    } catch (err) {
      console.error('Failed to save tasks:', err);
    }
  }, [session]);

  // Save settings to DB
  const persistSettings = useCallback(async (newSettings: Settings) => {
    if (!session) return;
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: newSettings }),
      });
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  }, [session]);

  const recalculate = useCallback(() => {
    setAiError(null);
    setTasks((prev) => {
      const reset = prev.map((t) => (t.status === 'done' ? t : { ...t, status: 'inbox' as const }));
      const result = prioritizeTasks(reset, settings.deepWorkHours, settings.delegates);
      persistTasks(result);
      return result;
    });
  }, [settings, persistTasks]);

  const recalculateWithAi = useCallback(async () => {
    setIsAiLoading(true);
    setAiError(null);

    const resetTasks = tasks.map((t) => (t.status === 'done' ? t : { ...t, status: 'inbox' as const }));

    try {
      const res = await fetch('/api/prioritize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: resetTasks, settings }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'AI prioritization failed');
      }

      const data = await res.json();
      setTasks(data.tasks);
      await persistTasks(data.tasks);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI prioritization failed';
      setAiError(message);
      const fallback = prioritizeTasks(resetTasks, settings.deepWorkHours, settings.delegates);
      setTasks(fallback);
      await persistTasks(fallback);
    } finally {
      setIsAiLoading(false);
    }
  }, [tasks, settings, persistTasks]);

  const syncCalendar = useCallback(async () => {
    setIsSyncing(true);
    setAiError(null);

    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarId: 'primary' }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Calendar sync failed');
      }

      const data = await res.json();
      const calendarTasks: Task[] = data.tasks;

      setTasks((prev) => {
        const manualTasks = prev.filter((t) => !t.id.startsWith('gcal_') && !t.id.startsWith('ai_'));
        const merged = [...manualTasks, ...calendarTasks];
        const result = prioritizeTasks(merged, settings.deepWorkHours, settings.delegates);
        persistTasks(result);
        return result;
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Calendar sync failed';
      setAiError(message);
    } finally {
      setIsSyncing(false);
    }
  }, [settings, persistTasks]);

  const syncSlack = useCallback(async () => {
    setIsSlackSyncing(true);
    setAiError(null);

    try {
      const res = await fetch('/api/slack-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channels: settings.slackChannels }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Slack sync failed');
      }

      const data = await res.json();
      const slackTasks: Task[] = data.tasks;

      setTasks((prev) => {
        const nonSlackTasks = prev.filter((t) => !t.id.startsWith('slack_'));
        const merged = [...nonSlackTasks, ...slackTasks];
        const result = prioritizeTasks(merged, settings.deepWorkHours, settings.delegates);
        persistTasks(result);
        return result;
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Slack sync failed';
      setAiError(message);
    } finally {
      setIsSlackSyncing(false);
    }
  }, [settings, persistTasks]);

  const syncMsTodo = useCallback(async () => {
    setIsMsTodoSyncing(true);
    setAiError(null);

    try {
      const res = await fetch('/api/ms-todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Microsoft To Do sync failed');
      }

      const data = await res.json();
      const msTodoTasks: Task[] = data.tasks;

      setTasks((prev) => {
        const nonMsTodoTasks = prev.filter((t) => !t.id.startsWith('mstodo_'));
        const merged = [...nonMsTodoTasks, ...msTodoTasks];
        const result = prioritizeTasks(merged, settings.deepWorkHours, settings.delegates);
        persistTasks(result);
        return result;
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Microsoft To Do sync failed';
      setAiError(message);
    } finally {
      setIsMsTodoSyncing(false);
    }
  }, [settings, persistTasks]);

  const getNextRecurrenceDate = (recurrence: Task['recurrence'], fromDate?: string): string => {
    const base = fromDate ? new Date(fromDate) : new Date();
    // Work with local date components to avoid timezone shift
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());

    if (recurrence === 'daily') {
      d.setDate(d.getDate() + 1);
    } else if (recurrence === 'weekly') {
      d.setDate(d.getDate() + 7);
    } else if (recurrence === 'weekdays') {
      d.setDate(d.getDate() + 1);
      // Skip to Monday if we land on Sat (6) or Sun (0)
      while (d.getDay() === 0 || d.getDay() === 6) {
        d.setDate(d.getDate() + 1);
      }
    }

    // Return as YYYY-MM-DD
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const moveTask = useCallback(
    (taskId: string, newStatus: Task['status']) => {
      let delegateTo: string | undefined;
      let delegationBrief: string | undefined;
      let recurTask: Task | undefined;
      let oldStatus: Task['status'] | undefined;
      let taskSkillBranch: Task['skillBranch'] | undefined;
      let allTop3Cleared = false;

      setTasks((prev) => {
        const taskBeingMoved = prev.find((t) => t.id === taskId);
        oldStatus = taskBeingMoved?.status;
        taskSkillBranch = taskBeingMoved?.skillBranch;

        const updated = prev.map((t) => {
          if (t.id !== taskId) return t;
          if (newStatus === 'outsource') {
            const delegate = findBestDelegate(t, settings.delegates);
            delegateTo = delegate;
            delegationBrief = generateDelegationBrief(t, delegate);
            return {
              ...t,
              status: newStatus,
              delegateTo: delegate,
              delegationBrief: generateDelegationBrief(t, delegate),
            };
          }
          return { ...t, status: newStatus };
        });

        // If a recurring task is marked done, create a fresh copy for next occurrence
        let withRecurrence = updated;
        if (
          newStatus === 'done' &&
          taskBeingMoved &&
          taskBeingMoved.recurrence &&
          taskBeingMoved.recurrence !== 'none'
        ) {
          const nextDeadline = getNextRecurrenceDate(taskBeingMoved.recurrence, taskBeingMoved.deadline);
          recurTask = {
            id: `${Date.now()}_recur`,
            title: taskBeingMoved.title,
            description: taskBeingMoved.description,
            category: taskBeingMoved.category,
            urgency: taskBeingMoved.urgency,
            revenueImpact: taskBeingMoved.revenueImpact,
            leverage: taskBeingMoved.leverage,
            founderOnly: taskBeingMoved.founderOnly,
            estimatedHours: taskBeingMoved.estimatedHours,
            status: 'inbox',
            recurrence: taskBeingMoved.recurrence,
            deadline: nextDeadline,
            source: taskBeingMoved.source,
            createdAt: new Date().toISOString(),
          };
          withRecurrence = [...updated, recurTask];
        }

        // Fire completion event when a top3 task is marked done
        if (newStatus === 'done') {
          const wasTop3 = prev.find((t) => t.id === taskId)?.status === 'top3';
          if (wasTop3) {
            const originalTop3Ids = prev.filter((t) => t.status === 'top3').map((t) => t.id);
            const nowDoneFromTop3 = updated.filter(
              (t) => t.status === 'done' && originalTop3Ids.includes(t.id)
            ).length;
            const total = 3;
            const count = nowDoneFromTop3;
            const messages: Record<number, string> = {
              1: 'Crushed it! 1/3 done \u{1F4AA}',
              2: 'On fire! 2/3 done \u{1F525}',
              3: 'All 3 done \u2014 go have a coffee \u2615',
            };
            const message = messages[count] || `${count}/${total} done!`;

            if (completionTimerRef.current) {
              clearTimeout(completionTimerRef.current);
            }
            setCompletionEvent({ count, total, message });
            completionTimerRef.current = setTimeout(() => {
              setCompletionEvent(null);
              completionTimerRef.current = null;
            }, 3000);

            // Check if all top3 are now cleared
            if (updated.filter((t) => t.status === 'top3').length === 0) {
              allTop3Cleared = true;
            }
          }
        }

        return withRecurrence;
      });

      // Award XP for task completion
      if (newStatus === 'done' && oldStatus && session) {
        const baseXp =
          oldStatus === 'top3'     ? XP_AWARDS.top3 :
          oldStatus === 'outsource' ? XP_AWARDS.outsource :
          oldStatus === 'notToday'  ? XP_AWARDS.notToday : 0;

        const totalXp = baseXp + (allTop3Cleared ? XP_AWARDS.allTop3Bonus : 0);

        if (totalXp > 0) {
          fetch('/api/xp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: totalXp, perfectDay: allTop3Cleared, skillBranch: taskSkillBranch }),
          }).then(async (res) => {
            if (!res.ok) return;
            const data = await res.json();
            // Refresh full stats to get updated skill XP
            fetch('/api/xp').then(async (r) => {
              if (r.ok) {
                const stats = await r.json();
                setUserStats(stats);
              }
            });
            setUserStats((prev) => ({
              ...prev,
              totalXp: data.newTotal,
              level: data.newLevel,
              ...(data.streakCount !== null ? { streakCount: data.streakCount } : {}),
            }));

            // Show XP float (include streak bonus in displayed amount)
            const displayXp = totalXp + (data.streakBonus ?? 0);
            if (xpTimerRef.current) clearTimeout(xpTimerRef.current);
            setXpGainEvent({ amount: displayXp, isBonus: allTop3Cleared, streakCount: data.streakCount });
            xpTimerRef.current = setTimeout(() => {
              setXpGainEvent(null);
              xpTimerRef.current = null;
            }, 2500);

            // Show level-up screen
            if (data.leveledUp) {
              setLevelUpEvent({ newLevel: data.newLevel, title: getLevelFromXp(data.newTotal).title, totalXp: data.newTotal });
            }
          }).catch(() => {});
        }
      }

      // Individual DB updates — don't touch other tasks
      if (session) {
        fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId, status: newStatus, delegateTo, delegationBrief }),
        }).catch((err) => console.error('Failed to update task status:', err));

        // If a recurring task was spawned, insert it individually
        if (recurTask) {
          const taskToInsert = recurTask;
          fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task: taskToInsert }),
          }).catch((err) => console.error('Failed to save recurrence task:', err));
        }
      }
    },
    [settings.delegates, session]
  );

  const addTask = useCallback(
    (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
        status: 'inbox',
        createdAt: new Date().toISOString(),
      };
      // Update in-memory state immediately
      setTasks((prev) => [...prev, newTask]);
      // Individual DB insert — only touches this one task, can't race with bulk syncs
      if (session) {
        fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task: newTask }),
        }).then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.error('Failed to save task to DB:', res.status, err);
          }
        }).catch((err) => console.error('Failed to save task (network):', err));
      }
    },
    [session]
  );

  const updateSettings = useCallback(
    (partial: Partial<Settings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...partial };
        persistSettings(updated);
        return updated;
      });
    },
    [persistSettings]
  );

  const dismissLevelUp = useCallback(() => setLevelUpEvent(null), []);

  const dismissCheckin = useCallback(() => {
    localStorage.setItem(LAST_CHECKIN_KEY, new Date().toDateString());
    setShowCheckin(false);
  }, []);

  const dismissWeeklySnapshot = useCallback(() => {
    const d = new Date();
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    localStorage.setItem(LAST_SNAPSHOT_KEY, d.toISOString().split('T')[0]);
    setWeeklySnapshot(null);
  }, []);

  const getDelegationBrief = useCallback(
    (taskId: string): string => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return '';
      const delegate = task.delegateTo || findBestDelegate(task, settings.delegates);
      return generateDelegationBrief(task, delegate);
    },
    [tasks, settings.delegates]
  );

  return (
    <TaskContext.Provider
      value={{
        tasks,
        settings,
        userStats,
        isAiLoading,
        isSyncing,
        isLoading,
        isAutoSyncing,
        syncProgress,
        aiError,
        completionEvent,
        xpGainEvent,
        levelUpEvent,
        dismissLevelUp,
        showCheckin,
        dismissCheckin,
        weeklySnapshot,
        dismissWeeklySnapshot,
        recalculate,
        recalculateWithAi,
        syncCalendar,
        syncSlack,
        syncMsTodo,
        isSlackSyncing,
        isMsTodoSyncing,
        moveTask,
        addTask,
        updateSettings,
        getDelegationBrief,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be used within TaskProvider');
  return ctx;
}
