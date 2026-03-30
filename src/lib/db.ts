import { getSupabase } from './supabase';
import { Task, Settings, Delegate } from '@/types';

// --- Users ---

export async function upsertUser(email: string, name?: string | null, image?: string | null): Promise<string> {
  const { data, error } = await getSupabase()
    .from('users')
    .upsert({ email, name, image }, { onConflict: 'email' })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to upsert user: ${error.message}`);
  return data.id;
}

export async function getUserByEmail(email: string) {
  const { data } = await getSupabase()
    .from('users')
    .select('id, email, name')
    .eq('email', email)
    .single();
  return data;
}

// --- Tasks ---

interface TaskRow {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: number;
  revenue_impact: number;
  leverage: number;
  founder_only: boolean;
  estimated_hours: number;
  deadline: string | null;
  status: string;
  delegate_to: string | null;
  delegation_brief: string | null;
  reasoning: string | null;
  source: string | null;
  gcal_event_id: string | null;
  recurrence: string | null;
  created_at: string;
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    category: row.category as Task['category'],
    urgency: row.urgency,
    revenueImpact: row.revenue_impact,
    leverage: row.leverage,
    founderOnly: row.founder_only,
    estimatedHours: row.estimated_hours,
    deadline: row.deadline || undefined,
    status: row.status as Task['status'],
    delegateTo: row.delegate_to || undefined,
    delegationBrief: row.delegation_brief || undefined,
    reasoning: row.reasoning || undefined,
    recurrence: (row.recurrence as Task['recurrence']) || 'none',
    createdAt: row.created_at,
  };
}

export async function getTasksForUser(userId: string): Promise<Task[]> {
  const { data, error } = await getSupabase()
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to get tasks: ${error.message}`);
  return (data || []).map(rowToTask);
}

export async function saveTasks(userId: string, tasks: Task[]): Promise<void> {
  const supabase = getSupabase();

  if (tasks.length === 0) return;

  const incomingIds = new Set(tasks.map((t) => t.id));

  // Only remove tasks not in the incoming set (stale synced tasks)
  // This prevents losing manual tasks the AI didn't return
  const { data: existingRows } = await supabase
    .from('tasks')
    .select('id')
    .eq('user_id', userId);

  const idsToRemove = (existingRows || [])
    .map((r: { id: string }) => r.id)
    .filter((id: string) => !incomingIds.has(id));

  if (idsToRemove.length > 0) {
    await supabase.from('tasks').delete().in('id', idsToRemove);
  }

  const rows = tasks.map((t) => ({
    id: t.id,
    user_id: userId,
    title: t.title,
    description: t.description,
    category: t.category,
    urgency: t.urgency,
    revenue_impact: t.revenueImpact,
    leverage: t.leverage,
    founder_only: t.founderOnly,
    estimated_hours: t.estimatedHours,
    deadline: t.deadline || null,
    status: t.status,
    delegate_to: t.delegateTo || null,
    delegation_brief: t.delegationBrief || null,
    reasoning: t.reasoning || null,
    source: t.source || (t.id.startsWith('gcal_') ? 'gcal' : t.id.startsWith('ai') ? 'ai' : t.id.startsWith('slack_') ? 'slack' : 'manual'),
    gcal_event_id: t.id.startsWith('gcal_') ? t.id.replace('gcal_', '') : null,
    recurrence: t.recurrence || 'none',
  }));

  // Upsert: update existing tasks, insert new ones
  const { error } = await supabase.from('tasks').upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(`Failed to save tasks: ${error.message}`);
}

export async function updateTaskStatus(
  taskId: string,
  status: string,
  delegateTo?: string,
  delegationBrief?: string,
  reasoning?: string
): Promise<void> {
  const update: Record<string, unknown> = { status };
  if (delegateTo !== undefined) update.delegate_to = delegateTo;
  if (delegationBrief !== undefined) update.delegation_brief = delegationBrief;
  if (reasoning !== undefined) update.reasoning = reasoning;

  const { error } = await getSupabase()
    .from('tasks')
    .update(update)
    .eq('id', taskId);

  if (error) throw new Error(`Failed to update task: ${error.message}`);
}

export async function addTaskToDb(userId: string, task: Task): Promise<string> {
  const { data, error } = await getSupabase()
    .from('tasks')
    .insert({
      user_id: userId,
      title: task.title,
      description: task.description,
      category: task.category,
      urgency: task.urgency,
      revenue_impact: task.revenueImpact,
      leverage: task.leverage,
      founder_only: task.founderOnly,
      estimated_hours: task.estimatedHours,
      deadline: task.deadline || null,
      status: task.status,
      source: 'manual',
      recurrence: task.recurrence || 'none',
    })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to add task: ${error.message}`);
  return data.id;
}

// --- Settings ---

interface SettingsRow {
  founder_name: string;
  deep_work_hours: number;
  delegates: Delegate[];
  company_name: string;
  company_description: string;
  company_stage: string;
  current_revenue: string;
  quarterly_goals: string[];
  biggest_bottleneck: string;
  pipeline_status: string;
  founder_superpower: string;
  avoid_delegate: string;
  slack_channels: Array<{ id: string; name: string }>;
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

export async function getSettings(userId: string): Promise<Settings> {
  const { data } = await getSupabase()
    .from('user_settings')
    .select('founder_name, deep_work_hours, delegates, company_name, company_description, company_stage, current_revenue, quarterly_goals, biggest_bottleneck, pipeline_status, founder_superpower, avoid_delegate, slack_channels')
    .eq('user_id', userId)
    .single();

  if (!data) {
    return { ...defaultSettings };
  }

  const row = data as SettingsRow;
  return {
    founderName: row.founder_name || defaultSettings.founderName,
    deepWorkHours: row.deep_work_hours ?? defaultSettings.deepWorkHours,
    delegates: row.delegates || [],
    companyName: row.company_name || '',
    companyDescription: row.company_description || '',
    companyStage: row.company_stage || '',
    currentRevenue: row.current_revenue || '',
    quarterlyGoals: row.quarterly_goals || ['', '', ''],
    biggestBottleneck: row.biggest_bottleneck || '',
    pipelineStatus: row.pipeline_status || '',
    founderSuperpower: row.founder_superpower || '',
    avoidDelegate: row.avoid_delegate || '',
    slackChannels: row.slack_channels || defaultSettings.slackChannels,
  };
}

export async function ensureSettings(userId: string, userName?: string | null): Promise<void> {
  const { data } = await getSupabase()
    .from('user_settings')
    .select('user_id')
    .eq('user_id', userId)
    .single();

  if (!data) {
    const founderName = userName ? userName.split(' ')[0] : defaultSettings.founderName;
    const { error } = await getSupabase()
      .from('user_settings')
      .insert({
        user_id: userId,
        founder_name: founderName,
        deep_work_hours: defaultSettings.deepWorkHours,
        delegates: defaultSettings.delegates,
        company_name: '',
        company_description: '',
        company_stage: '',
        current_revenue: '',
        quarterly_goals: ['', '', ''],
        biggest_bottleneck: '',
        pipeline_status: '',
        founder_superpower: '',
        avoid_delegate: '',
        slack_channels: defaultSettings.slackChannels,
      });

    if (error) console.error('Failed to ensure settings:', error.message);
  }
}

export async function saveSettings(userId: string, settings: Settings): Promise<void> {
  const { error } = await getSupabase()
    .from('user_settings')
    .upsert(
      {
        user_id: userId,
        founder_name: settings.founderName,
        deep_work_hours: settings.deepWorkHours,
        delegates: settings.delegates,
        company_name: settings.companyName,
        company_description: settings.companyDescription,
        company_stage: settings.companyStage,
        current_revenue: settings.currentRevenue,
        quarterly_goals: settings.quarterlyGoals,
        biggest_bottleneck: settings.biggestBottleneck,
        pipeline_status: settings.pipelineStatus,
        founder_superpower: settings.founderSuperpower,
        avoid_delegate: settings.avoidDelegate,
        slack_channels: settings.slackChannels,
      },
      { onConflict: 'user_id' }
    );

  if (error) throw new Error(`Failed to save settings: ${error.message}`);
}
