export type TaskCategory = 'sales' | 'marketing' | 'product' | 'operations' | 'finance' | 'hiring';
export type TaskStatus = 'inbox' | 'top3' | 'notToday' | 'outsource' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  urgency: number; // 1-5
  revenueImpact: number; // 1-5
  leverage: number; // 1-5
  founderOnly: boolean;
  estimatedHours: number;
  deadline?: string;
  status: TaskStatus;
  delegateTo?: string;
  delegationBrief?: string;
  reasoning?: string;
  source?: string; // 'manual' | 'google-calendar' | 'ai-generated' | 'slack'
  gcalEventId?: string;
  slackChannel?: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'weekdays';
  createdAt: string;
}

export interface Settings {
  founderName: string;
  deepWorkHours: number;
  delegates: Delegate[];
  companyName: string;
  companyDescription: string;
  companyStage: string;
  currentRevenue: string;
  quarterlyGoals: string[];
  biggestBottleneck: string;
  pipelineStatus: string;
  founderSuperpower: string;
  avoidDelegate: string;
  slackChannels: Array<{ id: string; name: string }>;
}

export interface Delegate {
  name: string;
  role: string;
  capabilities: TaskCategory[];
}

export interface UserStats {
  totalXp: number;
  level: number;
  streakCount: number;
  streakLastDate: string | null;
}
