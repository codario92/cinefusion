import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Browser/client-safe
export const supabase = createClient(supabaseUrl, anonKey);

// Server-side elevated client (use ONLY in route handlers / server actions)
export const supabaseAdmin = serviceKey
  ? createClient(supabaseUrl, serviceKey)
  : null;
