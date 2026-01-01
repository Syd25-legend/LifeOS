import { createClient } from '@supabase/supabase-js';

// These should be in .env, but for now we put placeholders or the values we know (if safe)
// Using import.meta.env for Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing!");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
