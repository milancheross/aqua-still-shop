import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Privileged Admin Supabase client using Service Role Key.
 * EXTREMELY SENSITIVE: Never import or use this in client-side code (browser).
 * Bypasses Row Level Security (RLS) for server-side administrative operations.
 */
export function createAdminSupabaseClient() {
  if (!serviceRoleKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is not defined. Admin operations may fail.");
  }
  return createClient(supabaseUrl, serviceRoleKey || "missing-service-key", {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
