// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Supabase env vars missing! Check .env file.");
  throw new Error("Supabase config not found");
}

// For public dashboard: caching + retry-friendly settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // no login sessions needed for your dashboard
    autoRefreshToken: false,
  },
  global: {
    headers: {
      "X-Client-Info": "MGNREGA-Dashboard",
    },
  },
});
