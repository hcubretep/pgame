'use client';

import { useTaskContext } from '@/context/TaskContext';
import { useState } from 'react';
import { Delegate, TaskCategory } from '@/types';

const allCategories: TaskCategory[] = ['sales', 'marketing', 'product', 'operations', 'finance', 'hiring'];

const stageOptions = [
  { value: '', label: 'Select stage...' },
  { value: 'pre-revenue', label: 'Pre-revenue' },
  { value: 'pre-seed', label: 'Pre-seed' },
  { value: 'seed', label: 'Seed' },
  { value: 'series-a', label: 'Series A' },
  { value: 'growth', label: 'Growth' },
];

const inputClass =
  'w-full border border-zinc-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400';
const labelClass = 'block text-xs font-medium text-zinc-600 mb-1';
const hintClass = 'text-xs text-zinc-400 mt-1';

export default function SettingsPage() {
  const { settings, updateSettings } = useTaskContext();
  const [newDelegate, setNewDelegate] = useState({ name: '', role: '', capabilities: '' });
  const [newChannel, setNewChannel] = useState({ id: '', name: '' });
  const [slackStatus, setSlackStatus] = useState<'checking' | 'connected' | 'not_connected'>('checking');

  // Check Slack connection status
  useState(() => {
    fetch('/api/slack-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channels: [] }),
    }).then((res) => {
      if (res.status === 500) {
        res.json().then((data) => {
          if (data.error?.includes('SLACK_USER_TOKEN')) {
            setSlackStatus('not_connected');
          } else {
            setSlackStatus('connected');
          }
        });
      } else if (res.status === 400) {
        // 400 means token exists but no channels — that's connected
        setSlackStatus('connected');
      } else {
        setSlackStatus('connected');
      }
    }).catch(() => {
      setSlackStatus('not_connected');
    });
  });

  const addSlackChannel = () => {
    if (!newChannel.id || !newChannel.name) return;
    const existing = settings.slackChannels || [];
    if (existing.some((c) => c.id === newChannel.id)) return;
    updateSettings({ slackChannels: [...existing, { id: newChannel.id, name: newChannel.name }] });
    setNewChannel({ id: '', name: '' });
  };

  const removeSlackChannel = (channelId: string) => {
    updateSettings({
      slackChannels: (settings.slackChannels || []).filter((c) => c.id !== channelId),
    });
  };

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

  const updateGoal = (index: number, value: string) => {
    const goals = [...(settings.quarterlyGoals || ['', '', ''])];
    goals[index] = value;
    updateSettings({ quarterlyGoals: goals });
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-8">Settings</h1>

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Founder Profile</h2>
        <div className="border border-zinc-200 rounded-lg p-4 bg-white space-y-4">
          <div>
            <label className={labelClass}>Name</label>
            <input
              type="text"
              value={settings.founderName}
              onChange={(e) => updateSettings({ founderName: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Deep work hours per day
            </label>
            <input
              type="number"
              min={1}
              max={8}
              step={0.5}
              value={settings.deepWorkHours}
              onChange={(e) => updateSettings({ deepWorkHours: parseFloat(e.target.value) })}
              className={inputClass}
            />
            <p className={hintClass}>
              This caps how much deep work gets scheduled as your top 3.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Business Context</h2>
        <p className="text-xs text-zinc-400 mb-4">
          This context helps the AI make much better prioritization decisions for your specific situation.
        </p>
        <div className="border border-zinc-200 rounded-lg p-4 bg-white space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Company name</label>
              <input
                type="text"
                value={settings.companyName || ''}
                onChange={(e) => updateSettings({ companyName: e.target.value })}
                placeholder="Acme Inc."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Current stage</label>
              <select
                value={settings.companyStage || ''}
                onChange={(e) => updateSettings({ companyStage: e.target.value })}
                className={inputClass}
              >
                {stageOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>What does your company do?</label>
            <input
              type="text"
              value={settings.companyDescription || ''}
              onChange={(e) => updateSettings({ companyDescription: e.target.value })}
              placeholder="AI-powered productivity tool for founders"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Current ARR / MRR</label>
            <input
              type="text"
              value={settings.currentRevenue || ''}
              onChange={(e) => updateSettings({ currentRevenue: e.target.value })}
              placeholder="e.g. $15k MRR, $180k ARR, pre-revenue"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Top 3 goals this quarter</label>
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <input
                  key={i}
                  type="text"
                  value={(settings.quarterlyGoals || ['', '', ''])[i] || ''}
                  onChange={(e) => updateGoal(i, e.target.value)}
                  placeholder={
                    i === 0
                      ? 'e.g. Close first 10 enterprise customers'
                      : i === 1
                        ? 'e.g. Ship v2 with team features'
                        : 'e.g. Raise seed round'
                  }
                  className={inputClass}
                />
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Biggest bottleneck right now</label>
            <textarea
              value={settings.biggestBottleneck || ''}
              onChange={(e) => updateSettings({ biggestBottleneck: e.target.value })}
              placeholder="e.g. Can't close deals fast enough — demo-to-close cycle is 6 weeks"
              rows={2}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Sales pipeline status</label>
            <textarea
              value={settings.pipelineStatus || ''}
              onChange={(e) => updateSettings({ pipelineStatus: e.target.value })}
              placeholder="e.g. 3 enterprise deals in final stage, 12 leads in nurture, 2 pilots running"
              rows={2}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Your superpower — what only you can do</label>
            <textarea
              value={settings.founderSuperpower || ''}
              onChange={(e) => updateSettings({ founderSuperpower: e.target.value })}
              placeholder="e.g. Close enterprise deals, set product vision, recruit senior engineers"
              rows={2}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>What should be avoided / delegated</label>
            <textarea
              value={settings.avoidDelegate || ''}
              onChange={(e) => updateSettings({ avoidDelegate: e.target.value })}
              placeholder="e.g. Social media content, routine customer support, bookkeeping"
              rows={2}
              className={inputClass}
            />
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

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Slack Integration</h2>
        <p className="text-xs text-zinc-400 mb-4">
          Pull action items from Slack conversations. Requires a Slack User Token.
        </p>
        <div className="border border-zinc-200 rounded-lg p-4 bg-white space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-600">Status:</span>
            {slackStatus === 'checking' ? (
              <span className="text-xs text-zinc-400">Checking...</span>
            ) : slackStatus === 'connected' ? (
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Connected
              </span>
            ) : (
              <span className="text-xs font-medium text-red-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                Not connected
              </span>
            )}
          </div>

          {slackStatus === 'not_connected' && (
            <div className="p-3 rounded bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-800">
                Add <code className="bg-amber-100 px-1 py-0.5 rounded text-[11px]">SLACK_USER_TOKEN</code> to your environment variables to enable Slack sync.
              </p>
            </div>
          )}

          <div>
            <label className={labelClass}>Channels to monitor</label>
            <div className="space-y-2 mb-3">
              {(settings.slackChannels || []).map((ch) => (
                <div
                  key={ch.id}
                  className="flex items-center justify-between border border-zinc-100 rounded px-3 py-2 bg-zinc-50"
                >
                  <div>
                    <span className="text-sm text-zinc-900">#{ch.name}</span>
                    <span className="text-xs text-zinc-400 ml-2">{ch.id}</span>
                  </div>
                  <button
                    onClick={() => removeSlackChannel(ch.id)}
                    className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {(settings.slackChannels || []).length === 0 && (
                <p className="text-xs text-zinc-400">No channels configured.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Channel ID (e.g. C08EN3KMTN1)"
                value={newChannel.id}
                onChange={(e) => setNewChannel({ ...newChannel, id: e.target.value })}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Channel name (e.g. general)"
                value={newChannel.name}
                onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                className={inputClass}
              />
            </div>
            <button
              onClick={addSlackChannel}
              className="mt-2 text-xs px-3 py-1.5 rounded bg-zinc-900 text-white hover:bg-zinc-700 transition-colors"
            >
              Add Channel
            </button>
          </div>
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
