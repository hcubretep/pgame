-- Migration: Add Slack channels config to user_settings
-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor -> New query)

ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS slack_channels JSONB DEFAULT '[]';
