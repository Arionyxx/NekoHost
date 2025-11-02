import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/supabase/types";
import { getEnv } from "@/lib/env";

/**
 * Create a Supabase client for use in Client Components
 * This client automatically handles authentication state and cookie storage
 */
export function createClient() {
  const env = getEnv();

  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          const cookies: { name: string; value: string }[] = [];
          if (typeof document !== "undefined") {
            const cookieArray = document.cookie.split(";");
            for (const cookie of cookieArray) {
              const [name, value] = cookie.trim().split("=");
              if (name && value) {
                cookies.push({ name, value: decodeURIComponent(value) });
              }
            }
          }
          return cookies;
        },
        setAll(cookiesToSet) {
          if (typeof document !== "undefined") {
            cookiesToSet.forEach(({ name, value, options }) => {
              const cookieOptions = {
                path: options?.path || "/",
                maxAge: options?.maxAge,
                sameSite: options?.sameSite || "lax",
                secure: options?.secure ?? process.env.NODE_ENV === "production",
              };

              let cookieString = `${name}=${encodeURIComponent(value)}`;
              cookieString += `; Path=${cookieOptions.path}`;
              if (cookieOptions.maxAge) {
                cookieString += `; Max-Age=${cookieOptions.maxAge}`;
              }
              cookieString += `; SameSite=${cookieOptions.sameSite}`;
              if (cookieOptions.secure) {
                cookieString += `; Secure`;
              }

              document.cookie = cookieString;
            });
          }
        },
      },
    }
  );
}
