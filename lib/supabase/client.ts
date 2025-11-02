import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/supabase/types";
import { getEnv } from "@/lib/env";

/**
 * Create a Supabase client for use in Client Components
 * This client automatically handles authentication state
 */
export function createClient() {
  const env = getEnv();

  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
