-- Migration: Add RPG XP + level + streak columns to users table
-- Run in Supabase SQL Editor

ALTER TABLE users ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_last_date DATE;

-- Add skill_branch and xp_awarded to tasks (needed for Sprint 3 but harmless now)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS skill_branch TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS xp_awarded INTEGER DEFAULT 0;
