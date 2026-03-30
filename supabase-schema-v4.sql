-- Migration: Add recurrence field to tasks
-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor -> New query)

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence TEXT DEFAULT 'none';
