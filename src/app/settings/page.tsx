'use client';

import { useTaskContext } from '@/context/TaskContext';
import { useState } from 'react';
import { Delegate, TaskCategory } from '@/types';

const allCategories: TaskCategory[] = ['sales', 'marketing', 'product', 'operations', 'finance', 'hiring'];

export default function SettingsPage() {
  const { settings, updateSettings } = useTaskContext();
  const [newDelegate, setNewDelegate] = useState({ name: '', role: '', capabilities: '' });

  const addDelegate = () => {
    if (!newDelegate.name || !newDelegate.role) return;
    const caps = newDelegate.capabilities
      .split(',')
      .map((c) => c.trim())
      .filter((c) => allCategories.includes(c as TaskCategory)) as TaskCategory[];

    const delegate: Delegate = {
      name: newDelegate.name,
      role: newDelegate.role,
      capabilities: caps.length > 0 ? caps : ['operations'],
    };

    updateSettings({
      delegates: [...settings.delegates, delegate],
    });
    setNewDelegate({ name: '', role: '', capabilities: '' });
  };

  const removeDelegate = (name: string) => {
    updateSettings({
      delegates: settings.delegates.filter((d) => d.name !== name),
    });
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-8">Settings</h1>

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Founder Profile</h2>
        <div className="border border-zinc-200 rounded-lg p-4 bg-white space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Name</label>
            <input
              type="text"
              value={settings.founderName}
              onChange={(e) => updateSettings({ founderName: e.target.value })}
              className="w-full border border-zinc-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Deep work hours per day
            </label>
            <input
              type="number"
              min={1}
              max={8}
              step={0.5}
              value={settings.deepWorkHours}
              onChange={(e) => updateSettings({ deepWorkHours: parseFloat(e.target.value) })}
              className="w-full border border-zinc-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
            <p className="text-xs text-zinc-400 mt-1">
              This caps how much deep work gets scheduled as your top 3.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Delegation Team</h2>
        <div className="space-y-3 mb-4">
          {settings.delegates.map((d) => (
            <div
              key={d.name}
              className="border border-zinc-200 rounded-lg p-3 bg-white flex items-center justify-between"
            >
              <div>
                <span className="text-sm font-medium text-zinc-900">{d.name}</span>
                <span className="text-xs text-zinc-400 ml-2">{d.role}</span>
                <div className="flex gap-1 mt-1">
                  {d.capabilities.map((c) => (
                    <span
                      key={c}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => removeDelegate(d.name)}
                className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="border border-zinc-200 rounded-lg p-4 bg-white space-y-3">
          <p className="text-xs font-medium text-zinc-600">Add delegate</p>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Name"
              value={newDelegate.name}
              onChange={(e) => setNewDelegate({ ...newDelegate, name: e.target.value })}
              className="border border-zinc-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
            <input
              type="text"
              placeholder="Role"
              value={newDelegate.role}
              onChange={(e) => setNewDelegate({ ...newDelegate, role: e.target.value })}
              className="border border-zinc-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
            <input
              type="text"
              placeholder="Capabilities (sales, marketing...)"
              value={newDelegate.capabilities}
              onChange={(e) => setNewDelegate({ ...newDelegate, capabilities: e.target.value })}
              className="border border-zinc-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>
          <button
            onClick={addDelegate}
            className="text-xs px-3 py-1.5 rounded bg-zinc-900 text-white hover:bg-zinc-700 transition-colors"
          >
            Add
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Scoring Logic</h2>
        <div className="border border-zinc-200 rounded-lg p-4 bg-white">
          <p className="text-xs text-zinc-500 leading-relaxed">
            Each task is scored using:
          </p>
          <code className="block text-xs text-zinc-700 bg-zinc-50 p-3 rounded mt-2 font-mono">
            score = (revenueImpact x 3) + (urgency x 2) + (leverage x 2) + (founderOnly ? 10 : 0) + deadlineBonus
          </code>
          <p className="text-xs text-zinc-500 leading-relaxed mt-3">
            The top 3 tasks that fit within your deep work budget are selected.
            Non-founder tasks with low scores are auto-delegated.
            Everything else goes to &quot;Not Today&quot;.
          </p>
          <p className="text-xs text-zinc-400 mt-2">
            Deadline bonus: overdue +5, due today +4, within 3 days +3, within 7 days +1.
          </p>
        </div>
      </section>
    </div>
  );
}
