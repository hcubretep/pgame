-- Migration: Add skill branch XP columns to users table
-- Run in Supabase SQL Editor

ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_builder_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_grower_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_operator_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_visionary_xp INTEGER DEFAULT 0;
