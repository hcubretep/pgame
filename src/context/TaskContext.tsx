'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { Task, Settings } from '@/types';
import { prioritizeTasks, generateDelegationBrief, findBestDelegate } from '@/lib/scoring';

interface TaskContextType {
  tasks: Task[];
  settings: Settings;
  isAiLoading: boolean;
  isSyncing: boolean;
  isLoading: boolean;
  aiError: string | null;
  recalculate: () => void;
  recalculateWithAi: () => Promise<void>;
  syncCalendar: () => Promise<void>;
  moveTask: (taskId: string, newStatus: Task['status']) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  getDelegationBrief: (taskId: string) => string;
}

const defaultSettings: Settings = {
  founderName: 'Founder',
  deepWorkHours: 3,
  delegates: [],
};

const TaskContext = createContext<TaskContextType | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const { data: session, status: authStatus } = useSession();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);

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
      try {
        const [tasksRes, settingsRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/settings'),
        ]);

        if (tasksRes.ok) {
          const { tasks: dbTasks } = await tasksRes.json();
          setTasks(dbTasks || []);
        }

        if (settingsRes.ok) {
          const { settings: dbSettings } = await settingsRes.json();
          if (dbSettings) {
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
        aiError,
        recalculate,
        recalculateWithAi,
        syncCalendar,
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
