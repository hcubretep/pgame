'use client';

import { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import TaskCard from '@/components/TaskCard';
import { TaskCategory } from '@/types';

const categories: TaskCategory[] = ['sales', 'marketing', 'product', 'operations', 'finance', 'hiring'];

export default function InboxPage() {
  const { tasks, addTask } = useTaskContext();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'sales' as TaskCategory,
    urgency: 3,
    revenueImpact: 3,
    leverage: 3,
    founderOnly: false,
    estimatedHours: 1,
    deadline: '',
  });

  const inboxTasks = tasks.filter((t) => t.status === 'inbox');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTask({
      ...form,
      deadline: form.deadline || undefined,
    });
    setForm({
      title: '',
      description: '',
      category: 'sales',
      urgency: 3,
      revenueImpact: 3,
      leverage: 3,
      founderOnly: false,
      estimatedHours: 1,
      deadline: '',
    });
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold">Task Inbox</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {inboxTasks.length} tasks waiting to be prioritized
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs px-3 py-1.5 rounded bg-zinc-900 text-white hover:bg-zinc-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'Add task'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-zinc-200 rounded-lg p-4 bg-white mb-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-zinc-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
              placeholder="What needs to happen?"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-zinc-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
              rows={2}
              placeholder="Context, why it matters, who's involved..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as TaskCategory })}
                className="w-full border border-zinc-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Est. hours</label>
              <input
                type="number"
                min={0.25}
                step={0.25}
                value={form.estimatedHours}
                onChange={(e) => setForm({ ...form, estimatedHours: parseFloat(e.target.value) })}
                className="w-full border border-zinc-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Urgency (1-5)</label>
              <input
                type="range"
                min={1}
                max={5}
                value={form.urgency}
                onChange={(e) => setForm({ ...form, urgency: parseInt(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-zinc-400">{form.urgency}/5</span>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Revenue (1-5)</label>
              <input
                type="range"
                min={1}
                max={5}
                value={form.revenueImpact}
                onChange={(e) => setForm({ ...form, revenueImpact: parseInt(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-zinc-400">{form.revenueImpact}/5</span>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Leverage (1-5)</label>
              <input
                type="range"
                min={1}
                max={5}
                value={form.leverage}
                onChange={(e) => setForm({ ...form, leverage: parseInt(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-zinc-400">{form.leverage}/5</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.founderOnly}
                onChange={(e) => setForm({ ...form, founderOnly: e.target.checked })}
                className="rounded"
              />
              <span className="text-xs text-zinc-600">Founder-only (only Peter can do this)</span>
            </label>
            <div className="flex-1">
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="border border-zinc-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
                placeholder="Deadline"
              />
            </div>
          </div>
          <button
            type="submit"
            className="text-xs px-4 py-2 rounded bg-zinc-900 text-white hover:bg-zinc-700 transition-colors"
          >
            Add to Inbox
          </button>
        </form>
      )}

      {inboxTasks.length === 0 ? (
        <p className="text-sm text-zinc-400">Inbox empty. All tasks have been prioritized.</p>
      ) : (
        <div className="space-y-3">
          {inboxTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
