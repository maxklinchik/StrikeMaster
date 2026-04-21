-- Add poll reactions table
CREATE TABLE IF NOT EXISTS poll_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL,
  user_id UUID NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  user_type VARCHAR(20) DEFAULT 'coach',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id, emoji)
);

CREATE INDEX idx_poll_reactions_poll ON poll_reactions(poll_id);
CREATE INDEX idx_poll_reactions_user ON poll_reactions(user_id);
