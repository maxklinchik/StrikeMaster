// Supabase Configuration
// Import from CDN for browser usage
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://mphwgkeplvqnqnlbaoha.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waHdna2VwbHZxbnFubGJhb2hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MTA2NjYsImV4cCI6MjA5MTk4NjY2Nn0.jI8YKPJ1ZbLXwG2XYz9Z7eP5V5Q7K8R9_QvW0XxYz_8';

// Create a single supabase client for interacting with your database
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Export URL for reference
export const supabaseUrl = SUPABASE_URL;
