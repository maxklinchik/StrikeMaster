-- =====================================================
-- STRIKE MASTER DATABASE SCHEMA (SIMPLIFIED)
-- Run this in Supabase SQL Editor
-- This replaces the old schema completely
-- =====================================================

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS records CASCADE;
DROP TABLE IF EXISTS match_permissions CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS player_scores CASCADE;
DROP TABLE IF EXISTS player_match_summary CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS opponents CASCADE;
DROP TABLE IF EXISTS schools CASCADE;

-- =====================================================
-- 1. USERS TABLE (Coach logins, team codes, team names)
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(50) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  team_name VARCHAR(255),           -- e.g., "Pascack Hills"
  team_code VARCHAR(10) UNIQUE,     -- 6-char code for students to join
  google_id VARCHAR(255) UNIQUE,    -- Google OAuth ID
  avatar_url TEXT,                  -- Profile picture URL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast team code lookups
CREATE INDEX idx_users_team_code ON users(team_code);

-- =====================================================
-- 2. STUDENTS TABLE (Students linked to coaches via team_code)
-- =====================================================
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team_code VARCHAR(10) NOT NULL,
  google_id VARCHAR(255) UNIQUE,    -- Google OAuth ID
  avatar_url TEXT,                  -- Profile picture URL
  name VARCHAR(255),                -- Full name for students
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast student lookups
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_coach ON students(coach_id);

-- =====================================================
-- 2. PLAYERS TABLE (Players with gender, name, team)
-- =====================================================
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('boys', 'girls')),
  email VARCHAR(255),
  grad_year INTEGER,
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,  -- Links to coach's user account
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast player lookups by coach
CREATE INDEX idx_players_coach ON players(coach_id);
CREATE INDEX idx_players_gender ON players(gender);

-- =====================================================
-- 2B. COACH ACCESS (Invite coaches to a team)
-- =====================================================
CREATE TABLE coach_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  can_edit BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(owner_coach_id, coach_id)
);

CREATE INDEX idx_coach_access_owner ON coach_access(owner_coach_id);
CREATE INDEX idx_coach_access_coach ON coach_access(coach_id);

-- =====================================================
-- 3. MATCHES TABLE (Opponent, final score, win/loss)
-- =====================================================
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('boys', 'girls')),
  match_type VARCHAR(20) DEFAULT 'team' CHECK (match_type IN ('team', 'tournament')),
  opponent VARCHAR(255) NOT NULL,
  match_date DATE NOT NULL,
  our_score INTEGER DEFAULT 0,
  opponent_score INTEGER DEFAULT 0,
  result VARCHAR(10) CHECK (result IN ('win', 'loss', 'tie', NULL)),
  location VARCHAR(255),
  is_complete BOOLEAN DEFAULT false,
  team_g1 INTEGER,
  team_g2 INTEGER,
  team_g3 INTEGER,
  opp_g1 INTEGER,
  opp_g2 INTEGER,
  opp_g3 INTEGER,
  team_g4 INTEGER,
  opp_g4 INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for match lookups
CREATE INDEX idx_matches_coach ON matches(coach_id);
CREATE INDEX idx_matches_gender ON matches(gender);
CREATE INDEX idx_matches_date ON matches(match_date);

-- =====================================================
-- 3C. ANNOUNCEMENTS
-- =====================================================
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(140) NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_announcements_coach ON announcements(coach_id);

-- =====================================================
-- 3B. MATCH PERMISSIONS (Shared coach access)
-- =====================================================
CREATE TABLE match_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  can_edit BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(match_id, coach_id)
);

CREATE INDEX idx_match_permissions_match ON match_permissions(match_id);
CREATE INDEX idx_match_permissions_coach ON match_permissions(coach_id);

-- =====================================================
-- 4. RECORDS TABLE (Player game scores per match)
-- =====================================================
CREATE TABLE records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  game1 INTEGER CHECK (game1 >= 0 AND game1 <= 300),
  game2 INTEGER CHECK (game2 >= 0 AND game2 <= 300),
  game3 INTEGER CHECK (game3 >= 0 AND game3 <= 300),
  game4 INTEGER CHECK (game4 >= 0 AND game4 <= 300),
  total INTEGER GENERATED ALWAYS AS (COALESCE(game1, 0) + COALESCE(game2, 0) + COALESCE(game3, 0) + COALESCE(game4, 0)) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(match_id, player_id)  -- One record per player per match
);

-- Indexes for record lookups
CREATE INDEX idx_records_match ON records(match_id);
CREATE INDEX idx_records_player ON records(player_id);

-- =====================================================
-- 5. Enable Row Level Security
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. Create permissive policies (service role access)
-- =====================================================
CREATE POLICY "Service role full access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON coach_access FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON matches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON match_permissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON announcements FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 7. Grant permissions
-- =====================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =====================================================google_id, avatar_url, created_at
-- students: id, email, password_hash, coach_id, team_code, google_id, avatar_url, name, 
-- SCHEMA SUMMARY:
-- =====================================================
-- users: id, email, username, first_name, last_name, team_name, team_code, created_at
-- players: id, first_name, last_name, gender, email, grad_year, coach_id, is_active, created_at
-- coach_access: id, owner_coach_id, coach_id, can_edit, created_at
-- matches: id, coach_id, gender, match_type, opponent, match_date, our_score, opponent_score, result, location, is_complete, team_g1, team_g2, team_g3, team_g4, opp_g1, opp_g2, opp_g3, opp_g4, created_at
-- match_permissions: id, match_id, coach_id, can_edit, created_at
-- records: id, match_id, player_id, game1, game2, game3, game4, total (auto-calculated), created_at
-- announcements: id, coach_id, title, body, created_at
