-- =====================================================
-- CLEANUP AND RESET SCRIPT
-- Run this in Supabase SQL Editor to start fresh
-- =====================================================

-- =====================================================
-- STEP 1: Delete all Supabase Auth users
-- =====================================================
-- This removes all user accounts from Supabase Authentication
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users LOOP
    -- Delete each user from auth
    DELETE FROM auth.users WHERE id = user_record.id;
  END LOOP;
END $$;

-- =====================================================
-- STEP 2: Drop and recreate all tables
-- =====================================================
DROP TABLE IF EXISTS records CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS player_scores CASCADE;
DROP TABLE IF EXISTS player_match_summary CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS opponents CASCADE;
DROP TABLE IF EXISTS schools CASCADE;

-- =====================================================
-- STEP 3: Create fresh tables
-- =====================================================

-- USERS TABLE (Coach logins, team codes, team names)
CREATE TABLE users (
  id UUID PRIMARY KEY,  -- This will match Supabase Auth user ID
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  team_name VARCHAR(255),           -- e.g., "Pascack Hills"
  team_code VARCHAR(10) UNIQUE,     -- 6-char code for students to join
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_team_code ON users(team_code);

-- PLAYERS TABLE (Players with gender, name, coach)
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('boys', 'girls')),
  grad_year INTEGER,
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_players_coach ON players(coach_id);
CREATE INDEX idx_players_gender ON players(gender);

-- MATCHES TABLE (Opponent, final score, win/loss)
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('boys', 'girls')),
  opponent VARCHAR(255) NOT NULL,
  match_date DATE NOT NULL,
  our_score INTEGER DEFAULT 0,
  opponent_score INTEGER DEFAULT 0,
  result VARCHAR(10) CHECK (result IN ('win', 'loss', 'tie', NULL)),
  location VARCHAR(255),
  comments TEXT,
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_matches_coach ON matches(coach_id);
CREATE INDEX idx_matches_gender ON matches(gender);
CREATE INDEX idx_matches_date ON matches(match_date);

-- RECORDS TABLE (Player game scores per match)
CREATE TABLE records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  game1 INTEGER CHECK (game1 >= 0 AND game1 <= 300),
  game2 INTEGER CHECK (game2 >= 0 AND game2 <= 300),
  game3 INTEGER CHECK (game3 >= 0 AND game3 <= 300),
  total INTEGER GENERATED ALWAYS AS (COALESCE(game1, 0) + COALESCE(game2, 0) + COALESCE(game3, 0)) STORED,
  is_varsity BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(match_id, player_id)
);

CREATE INDEX idx_records_match ON records(match_id);
CREATE INDEX idx_records_player ON records(player_id);

-- =====================================================
-- STEP 4: Enable Row Level Security
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: Create permissive policies
-- =====================================================
DROP POLICY IF EXISTS "Service role full access" ON users;
DROP POLICY IF EXISTS "Service role full access" ON players;
DROP POLICY IF EXISTS "Service role full access" ON matches;
DROP POLICY IF EXISTS "Service role full access" ON records;

CREATE POLICY "Service role full access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON matches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON records FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- STEP 6: Grant permissions
-- =====================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =====================================================
-- DONE! Now you can sign up a new account in the app
-- =====================================================
