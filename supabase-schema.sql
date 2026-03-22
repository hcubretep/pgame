-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'operations',
  urgency INT NOT NULL DEFAULT 3,
  revenue_impact INT NOT NULL DEFAULT 3,
  leverage INT NOT NULL DEFAULT 3,
  founder_only BOOLEAN DEFAULT FALSE,
  estimated_hours FLOAT NOT NULL DEFAULT 1,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'inbox',
  delegate_to TEXT,
  delegation_brief TEXT,
  reasoning TEXT,
  source TEXT DEFAULT 'manual',
  gcal_event_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings table
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  founder_name TEXT DEFAULT 'Founder',
  deep_work_hours FLOAT DEFAULT 3,
  delegates JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policies: service role can do everything (our API routes use the secret key)
CREATE POLICY "Service role full access" ON users FOR ALL USING (true);
CREATE POLICY "Service role full access" ON tasks FOR ALL USING (true);
CREATE POLICY "Service role full access" ON user_settings FOR ALL USING (true);
