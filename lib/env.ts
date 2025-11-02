import { z } from "zod";

/**
 * Environment variable validation schema
 * This ensures all required Supabase configuration is present at runtime
 */
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({
    message: "NEXT_PUBLIC_SUPABASE_URL must be a valid URL",
  }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, {
    message: "NEXT_PUBLIC_SUPABASE_ANON_KEY is required",
  }),
});

/**
 * Validates and returns environment variables
 * Throws an error if validation fails (but only in browser)
 */
export function getEnv() {
  // During build time, we might not have env vars, so return placeholders
  if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
    return {
      NEXT_PUBLIC_SUPABASE_URL:
        process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder",
    };
  }

  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) {
    console.error(
      "❌ Environment variable validation failed:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error(
      "Missing or invalid environment variables. Check your .env.local file."
    );
  }

  return parsed.data;
}
