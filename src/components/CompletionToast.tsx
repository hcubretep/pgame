'use client';

import { useTaskContext } from '@/context/TaskContext';

export default function CompletionToast() {
  const { completionEvent } = useTaskContext();

  if (!completionEvent) return null;

  const { count, total, message } = completionEvent;
  const progress = (count / total) * 100;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-zinc-900 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-4 min-w-[280px]">
        <p className="text-sm font-medium whitespace-nowrap">{message}</p>
        <div className="flex-1 min-w-[60px]">
          <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
