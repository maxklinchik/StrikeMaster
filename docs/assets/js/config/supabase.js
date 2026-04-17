// Supabase Configuration
// Import from CDN for browser usage
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://fxqddamrgadttkfxvjth.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_nJI28qbo7Fq-5geesWG31w_jUyOl0Wn';

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
