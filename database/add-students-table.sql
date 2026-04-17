-- =====================================================
-- ADD STUDENTS TABLE TO EXISTING DATABASE
-- Run this in Supabase SQL Editor to add student support
-- =====================================================

-- Drop if exists (safe to re-run)
DROP TABLE IF EXISTS students CASCADE;

-- Create students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team_code VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast student lookups
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_coach ON students(coach_id);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create permissive policy (service role access)
CREATE POLICY "Service role full access" ON students FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON students TO service_role;

-- =====================================================
-- DONE! Students can now sign up with:
-- - email
-- - password  
-- - team_code (from their coach)
-- =====================================================
