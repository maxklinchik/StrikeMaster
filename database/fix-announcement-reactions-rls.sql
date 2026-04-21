-- Disable RLS on announcement_reactions table (backend uses service key which bypasses RLS)
ALTER TABLE announcement_reactions DISABLE ROW LEVEL SECURITY;
