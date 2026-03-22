-- Migration: Add founder context fields to user_settings
-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor -> New query)

ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS company_name TEXT DEFAULT '';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS company_description TEXT DEFAULT '';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS company_stage TEXT DEFAULT '';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS current_revenue TEXT DEFAULT '';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS quarterly_goals JSONB DEFAULT '["", "", ""]';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS biggest_bottleneck TEXT DEFAULT '';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS pipeline_status TEXT DEFAULT '';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS founder_superpower TEXT DEFAULT '';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS avoid_delegate TEXT DEFAULT '';
