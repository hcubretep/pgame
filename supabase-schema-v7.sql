-- Sprint 4: Daily logs for weekly snapshot
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  tasks_completed INTEGER DEFAULT 0,
  top3_cleared BOOLEAN DEFAULT FALSE,
  xp_earned INTEGER DEFAULT 0,
  skill_breakdown JSONB DEFAULT '{}',
  UNIQUE(user_id, date)
);

-- Index for fast weekly queries
CREATE INDEX IF NOT EXISTS daily_logs_user_date ON daily_logs(user_id, date DESC);
