'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { Task, Settings } from '@/types';
import { prioritizeTasks, generateDelegationBrief, findBestDelegate } from '@/lib/scoring';

interface CompletionEvent {
  count: number;
  total: number;
  message: string;
}

interface TaskContextType {
  tasks: Task[];
  settings: Settings;
  isAiLoading: boolean;
  isSyncing: boolean;
  isLoading: boolean;
  isAutoSyncing: boolean;
  aiError: string | null;
  completionEvent: CompletionEvent | null;
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

const SYNC_STALE_MS = 4 * 60 * 60 * 1000; // 4 hours
const LAST_SYNC_KEY = 'pgame_last_sync';

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
  const [aiError, setAiError] = useState<string | null>(null);
  const [completionEvent, setCompletionEvent] = useState<CompletionEvent | null>(null);
  const completionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoSynced = useRef(false);

  // Load tasks and settings from DB on auth
  useEffect(() => {
    if (authStatus === 'loading') return;
    if (!session) {
      setIsLoading(false);
      setTasks([]);
      setSettings(defaultSettings);
      return;
    }

    const currentSession = session;
    async function loadData() {
      let loadedTasks: Task[] = [];
      try {
        const [tasksRes, settingsRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/settings'),
        ]);

        if (tasksRes.ok) {
          const { tasks: dbTasks } = await tasksRes.json();
          loadedTasks = dbTasks || [];
          setTasks(loadedTasks);
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
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setIsLoading(false);
      }

      // Auto-sync if stale or empty
      if (!hasAutoSynced.current && currentSession) {
        hasAutoSynced.current = true;
        const lastSync = localStorage.getItem(LAST_SYNC_KEY);
        const lastSyncTime = lastSync ? parseInt(lastSync, 10) : 0;
        const isStale = Date.now() - lastSyncTime > SYNC_STALE_MS;
        const isEmpty = loadedTasks.length === 0;

        if (isStale || isEmpty) {
          setIsAutoSyncing(true);
          try {
            // Sync Calendar + Slack + MS Todo in parallel
            const [calRes, slackRes, msTodoRes] = await Promise.allSettled([
              fetch('/api/calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ calendarId: 'primary' }),
              }).then(async (r) => {
                if (!r.ok) return [];
                const d = await r.json();
                return (d.tasks || []) as Task[];
              }),
              fetch('/api/slack-sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channels: defaultSettings.slackChannels }),
              }).then(async (r) => {
                if (!r.ok) return [];
                const d = await r.json();
                return (d.tasks || []) as Task[];
              }),
              fetch('/api/ms-todo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
              }).then(async (r) => {
                if (!r.ok) return [];
                const d = await r.json();
                return (d.tasks || []) as Task[];
              }),
            ]);

            const calTasks = calRes.status === 'fulfilled' ? calRes.value : [];
            const slackTasks = slackRes.status === 'fulfilled' ? slackRes.value : [];
            const msTodoTasks = msTodoRes.status === 'fulfilled' ? msTodoRes.value : [];

            // Merge: remove synced-source tasks from loaded, add fresh ones
            const manualTasks = loadedTasks.filter(
              (t) => !t.id.startsWith('gcal_') && !t.id.startsWith('ai_') && !t.id.startsWith('slack_') && !t.id.startsWith('mstodo_')
            );
            const merged = [...manualTasks, ...calTasks, ...slackTasks, ...msTodoTasks];
            setTasks(merged);

            // Now run AI prioritization on the merged set
            try {
              const aiRes = await fetch('/api/prioritize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  tasks: merged.map((t) => (t.status === 'done' ? t : { ...t, status: 'inbox' as const })),
                  settings: defaultSettings,
                }),
              });

              if (aiRes.ok) {
                const aiData = await aiRes.json();
                setTasks(aiData.tasks);
                // Persist
                await fetch('/api/tasks', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ tasks: aiData.tasks }),
                });
              }
            } catch (aiErr) {
              console.error('Auto-sync AI prioritization failed:', aiErr);
            }

            localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
          } catch (err) {
            console.error('Auto-sync failed:', err);
          } finally {
            setIsAutoSyncing(false);
          }
        }
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

  const moveTask = useCallback(
    (taskId: string, newStatus: Task['status']) => {
      setTasks((prev) => {
        const updated = prev.map((t) => {
          if (t.id !== taskId) return t;
          if (newStatus === 'outsource') {
            const delegate = findBestDelegate(t, settings.delegates);
            return {
              ...t,
              status: newStatus,
              delegateTo: delegate,
              delegationBrief: generateDelegationBrief(t, delegate),
            };
          }
          return { ...t, status: newStatus };
        });

        // Fire completion event when a top3 task is marked done
        if (newStatus === 'done') {
          const wasTop3 = prev.find((t) => t.id === taskId)?.status === 'top3';
          if (wasTop3) {
            // Count tasks that were originally top3 and are now done
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
          }
        }

        persistTasks(updated);
        return updated;
      });
    },
    [settings.delegates, persistTasks]
  );

  const addTask = useCallback(
    (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
        status: 'inbox',
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => {
        const updated = [...prev, newTask];
        persistTasks(updated);
        return updated;
      });
    },
    [persistTasks]
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
        isAiLoading,
        isSyncing,
        isLoading,
        isAutoSyncing,
        aiError,
        completionEvent,
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
