'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Task, Settings } from '@/types';
import { mockTasks, mockSettings } from '@/lib/mockData';
import { prioritizeTasks, generateDelegationBrief, findBestDelegate } from '@/lib/scoring';

interface TaskContextType {
  tasks: Task[];
  settings: Settings;
  isAiLoading: boolean;
  aiError: string | null;
  recalculate: () => void;
  recalculateWithAi: () => Promise<void>;
  moveTask: (taskId: string, newStatus: Task['status']) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  getDelegationBrief: (taskId: string) => string;
}

const TaskContext = createContext<TaskContextType | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(mockSettings);
  const [tasks, setTasks] = useState<Task[]>(() =>
    prioritizeTasks(mockTasks, mockSettings.deepWorkHours, mockSettings.delegates)
  );
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const recalculate = useCallback(() => {
    setAiError(null);
    setTasks((prev) => {
      const reset = prev.map((t) => (t.status === 'done' ? t : { ...t, status: 'inbox' as const }));
      return prioritizeTasks(reset, settings.deepWorkHours, settings.delegates);
    });
  }, [settings]);

  const recalculateWithAi = useCallback(async () => {
    setIsAiLoading(true);
    setAiError(null);

    // Reset tasks to inbox first
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI prioritization failed';
      setAiError(message);
      // Fall back to local scoring
      setTasks(prioritizeTasks(resetTasks, settings.deepWorkHours, settings.delegates));
    } finally {
      setIsAiLoading(false);
    }
  }, [tasks, settings]);

  const moveTask = useCallback(
    (taskId: string, newStatus: Task['status']) => {
      setTasks((prev) =>
        prev.map((t) => {
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
        })
      );
    },
    [settings.delegates]
  );

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      status: 'inbox',
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
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
        isAiLoading,
        aiError,
        recalculate,
        recalculateWithAi,
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
