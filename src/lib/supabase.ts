import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Safely handle missing keys during Next.js static page generation/prerendering
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : ({
      auth: {
        signInWithPassword: () => Promise.resolve({ data: { session: null }, error: new Error('Supabase URL/Key is not set. Please check environment variables.') }),
        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: new Error('Supabase URL/Key is not set. Please check environment variables.') }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      },
    } as any);

