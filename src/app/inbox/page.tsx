'use client';

import { useState, useRef, useEffect } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { TaskCategory, Task } from '@/types';

const categoryColors: Record<string, string> = {
  sales: 'bg-blue-50 text-blue-700 border-blue-200',
  marketing: 'bg-purple-50 text-purple-700 border-purple-200',
  product: 'bg-green-50 text-green-700 border-green-200',
  operations: 'bg-amber-50 text-amber-700 border-amber-200',
  finance: 'bg-rose-50 text-rose-700 border-rose-200',
  hiring: 'bg-cyan-50 text-cyan-700 border-cyan-200',
};

const categories: TaskCategory[] = ['sales', 'marketing', 'product', 'operations', 'finance', 'hiring'];

type FilterType = 'all' | 'inbox' | 'top3' | 'notToday' | 'outsource' | 'done';

type RecurrenceType = 'none' | 'daily' | 'weekdays' | 'weekly';

const recurrenceOptions: { value: RecurrenceType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekly', label: 'Weekly' },
];

export default function InboxPage() {
  const { tasks, addTask, moveTask } = useTaskContext();
  const [quickTitle, setQuickTitle] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle.trim(),
      description: '',
      category: 'operations',
      urgency: 3,
      revenueImpact: 3,
      leverage: 3,
      founderOnly: false,
      estimatedHours: 0.5,
      recurrence: recurrence === 'none' ? undefined : recurrence,
    } as Omit<Task, 'id' | 'createdAt' | 'status'>);
    setQuickTitle('');
    setRecurrence('none');
    inputRef.current?.focus();
  };

  const filteredTasks = filter === 'all'
    ? tasks.filter(t => t.status !== 'done')
    : tasks.filter(t => t.status === filter);

  const doneTasks = tasks.filter(t => t.status === 'done');

  const counts = {
    all: tasks.filter(t => t.status !== 'done').length,
    inbox: tasks.filter(t => t.status === 'inbox').length,
    top3: tasks.filter(t => t.status === 'top3').length,
    notToday: tasks.filter(t => t.status === 'notToday').length,
    outsource: tasks.filter(t => t.status === 'outsource').length,
    done: doneTasks.length,
  };

  const statusLabels: Record<string, string> = {
    inbox: 'Inbox',
    top3: 'Top 3',
    notToday: 'Not Today',
    outsource: 'Outsource',
    done: 'Done',
  };

  const statusColors: Record<string, string> = {
    inbox: 'text-zinc-500',
    top3: 'text-zinc-900 font-medium',
    notToday: 'text-amber-600',
    outsource: 'text-purple-600',
    done: 'text-emerald-600',
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Tasks</h1>
        <p className="text-sm text-zinc-400 mt-1">
          {counts.all} active tasks
        </p>
      </div>

      {/* Quick Add */}
      <form onSubmit={handleQuickAdd} className="mb-6">
        <div className="border border-zinc-200 rounded-lg bg-white focus-within:border-zinc-400 focus-within:ring-1 focus-within:ring-zinc-200 transition-all">
          <div className="flex items-center gap-3 px-4 py-3">
            <svg className="w-5 h-5 text-zinc-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="Add a task... (press Enter)"
              className="flex-1 text-sm bg-transparent outline-none placeholder-zinc-300"
            />
            {quickTitle.trim() && (
              <button
                type="submit"
                className="text-xs px-3 py-1 rounded bg-zinc-900 text-white hover:bg-zinc-700 transition-colors shrink-0"
              >
                Add
              </button>
            )}
          </div>
          {quickTitle.trim() && (
            <div className="flex items-center gap-1.5 px-4 pb-3">
              <span className="text-[10px] text-zinc-400 mr-0.5">Repeat:</span>
              {recurrenceOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRecurrence(opt.value)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                    recurrence === opt.value
                      ? 'bg-sky-600 border-sky-600 text-white'
                      : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </form>

      {/* Filters */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {(['all', 'inbox', 'top3', 'notToday', 'outsource', 'done'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
            }`}
          >
            {f === 'all' ? 'Active' : f === 'notToday' ? 'Not Today' : f === 'top3' ? 'Top 3' : f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-1 opacity-60">{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-1">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-zinc-300">
              {filter === 'all' ? 'No tasks yet. Type above to add one.' : `No ${filter} tasks.`}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`group border border-zinc-100 rounded-lg bg-white hover:border-zinc-200 transition-all ${
                expandedTask === task.id ? 'border-zinc-200 shadow-sm' : ''
              }`}
            >
              {/* Main Row */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Checkbox */}
                <button
                  onClick={() => moveTask(task.id, 'done')}
                  className="w-5 h-5 rounded-full border-2 border-zinc-200 hover:border-emerald-400 hover:bg-emerald-50 transition-colors shrink-0 flex items-center justify-center"
                  title="Mark as done"
                >
                  <svg className="w-3 h-3 text-transparent group-hover:text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>

                {/* Title + Meta */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-900 truncate">{task.title}</span>
                    {task.founderOnly && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-white shrink-0">F</span>
                    )}
                  </div>
                  {task.description && expandedTask !== task.id && (
                    <p className="text-xs text-zinc-400 truncate mt-0.5">{task.description}</p>
                  )}
                </div>

                {/* Right side badges */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${categoryColors[task.category]}`}>
                    {task.category}
                  </span>
                  <span className={`text-[10px] ${statusColors[task.status]}`}>
                    {statusLabels[task.status]}
                  </span>
                  {task.recurrence && task.recurrence !== 'none' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100">
                      ↻
                    </span>
                  )}
                  {task.source && task.source !== 'manual' && (
                    <span className="text-[10px] text-zinc-300">
                      {task.source === 'google-calendar' ? '📅' : task.source === 'slack' ? '💬' : task.source === 'ai-generated' ? '🤖' : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded Detail */}
              {expandedTask === task.id && (
                <div className="px-4 pb-4 pt-1 border-t border-zinc-50">
                  {task.description && (
                    <p className="text-xs text-zinc-500 mb-3 leading-relaxed">{task.description}</p>
                  )}
                  {task.reasoning && (
                    <p className="text-xs text-zinc-400 italic mb-3">{task.reasoning}</p>
                  )}

                  {/* Quick Edit Row */}
                  {editingTask === task.id ? (
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-1">Category</label>
                        <select
                          value={task.category}
                          onChange={() => {/* TODO: inline edit */}}
                          className="w-full text-xs border border-zinc-200 rounded px-2 py-1"
                        >
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-1">Urgency</label>
                        <input type="range" min={1} max={5} value={task.urgency} className="w-full" readOnly />
                        <span className="text-[10px] text-zinc-400">{task.urgency}/5</span>
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-1">Revenue</label>
                        <input type="range" min={1} max={5} value={task.revenueImpact} className="w-full" readOnly />
                        <span className="text-[10px] text-zinc-400">{task.revenueImpact}/5</span>
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-1">Leverage</label>
                        <input type="range" min={1} max={5} value={task.leverage} className="w-full" readOnly />
                        <span className="text-[10px] text-zinc-400">{task.leverage}/5</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 mb-3 text-[10px] text-zinc-400">
                      <span>Urgency: {task.urgency}/5</span>
                      <span>Revenue: {task.revenueImpact}/5</span>
                      <span>Leverage: {task.leverage}/5</span>
                      <span>Time: {task.estimatedHours}h</span>
                      {task.deadline && <span>Due: {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                      {task.delegateTo && <span>→ {task.delegateTo}</span>}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-1.5">
                    {task.status !== 'top3' && (
                      <button
                        onClick={() => moveTask(task.id, 'top3')}
                        className="text-[11px] px-2.5 py-1 rounded bg-zinc-900 text-white hover:bg-zinc-700 transition-colors"
                      >
                        Top 3
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
                    {task.status !== 'inbox' && (
                      <button
                        onClick={() => moveTask(task.id, 'inbox')}
                        className="text-[11px] px-2.5 py-1 rounded bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
                      >
                        Back to inbox
                      </button>
                    )}
                    <button
                      onClick={() => setEditingTask(editingTask === task.id ? null : task.id)}
                      className="text-[11px] px-2.5 py-1 rounded bg-zinc-50 text-zinc-400 hover:bg-zinc-100 transition-colors ml-auto"
                    >
                      {editingTask === task.id ? 'Close' : 'Details'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Done section (collapsed by default) */}
      {filter === 'done' && doneTasks.length > 0 && (
        <div className="mt-8">
          <div className="space-y-1">
            {doneTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 px-4 py-3 border border-zinc-50 rounded-lg opacity-50"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-zinc-400 line-through">{task.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
