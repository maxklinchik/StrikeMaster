-- Add announcement reactions table
CREATE TABLE IF NOT EXISTS announcement_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  user_type VARCHAR(20) DEFAULT 'coach',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(announcement_id, user_id, emoji)
);

CREATE INDEX idx_announcement_reactions_announcement ON announcement_reactions(announcement_id);
CREATE INDEX idx_announcement_reactions_user ON announcement_reactions(user_id);
