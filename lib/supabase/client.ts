import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/supabase/types";

/**
 * Create a Supabase client for use in Client Components
 * This client automatically handles authentication state
 */
export function createClient() {
  return createClientComponentClient<Database>();
}
