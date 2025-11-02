import { createClient } from '@supabase/supabase-js';

// Note: This file will throw an error at runtime if the environment variables are not set.
// Before using Supabase in your application, make sure to:
// 1. Copy .env.example to .env.local
// 2. Add your Supabase project URL and anon key
// The client is not used by default and won't cause issues until you import it.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check .env.example and configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
