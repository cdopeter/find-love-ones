import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Admin Client using Service Role Key
 * WARNING: This bypasses Row Level Security (RLS) and should ONLY be used server-side
 * Never expose this client to the browser or client-side code
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please check .env.example and configure in your .env.local file.'
  );
}

if (!supabaseServiceRole) {
  throw new Error(
    'Missing SUPABASE_SERVICE_ROLE environment variable. This is required for server-side admin operations. Please check .env.example and configure in your .env.local file.'
  );
}

/**
 * Admin client with service role privileges
 * Use with extreme caution - bypasses all RLS policies
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Verify that the admin client is properly configured
 * Call this in API routes that use the admin client
 */
export function verifyAdminClient(): void {
  if (!supabaseUrl || !supabaseServiceRole) {
    throw new Error('Supabase admin client is not properly configured');
  }
}
