/**
 * Central export for Supabase utilities
 *
 * Client-side:
 * - createClient() from './client'
 * - useSession(), useSupabase() from './auth-context'
 *
 * Server-side:
 * - createClient(), getUser(), getSession() from './server'
 */

// Re-export client utilities
export { createClient as createBrowserClient } from "./client";

// Re-export server utilities
export {
  createClient as createServerClient,
  getUser,
  getSession,
} from "./server";

// Re-export auth context and hooks
export { AuthProvider, useSession, useSupabase } from "./auth-context";

// Re-export middleware utility
export { updateSession } from "./middleware";
