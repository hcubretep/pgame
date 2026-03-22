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
  createdAt: string;
}

export interface Settings {
  founderName: string;
  deepWorkHours: number;
  delegates: Delegate[];
}

export interface Delegate {
  name: string;
  role: string;
  capabilities: TaskCategory[];
}
