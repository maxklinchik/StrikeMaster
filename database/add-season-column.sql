-- Add season column to matches table
ALTER TABLE matches ADD COLUMN season VARCHAR(20) DEFAULT '2025-2026';

-- Create index for fast season lookups
CREATE INDEX idx_matches_season ON matches(season);

-- Create composite index for common queries (coach + season)
CREATE INDEX idx_matches_coach_season ON matches(coach_id, season);

-- Verify the migration
SELECT COUNT(*) as total_matches, COUNT(DISTINCT season) as unique_seasons FROM matches;
