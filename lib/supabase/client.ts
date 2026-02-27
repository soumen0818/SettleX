import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file."
  );
}

/**
 * Default Supabase client for browser use (without authentication).
 * Use this for initial loads and public queries.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * Create an authenticated Supabase client with wallet address header.
 * This is required for RLS policies to work correctly.
 * 
 * @param walletAddress - The Stellar wallet address of the current user
 * @returns Supabase client configured with authentication header
 */
export function createAuthenticatedClient(walletAddress: string) {
  if (!walletAddress) {
    throw new Error('Wallet address is required for authenticated requests');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'x-wallet-address': walletAddress,
      },
    },
  });
}

