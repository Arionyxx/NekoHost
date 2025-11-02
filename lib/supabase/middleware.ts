import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Database } from "@/supabase/types";

/**
 * Middleware to handle authentication and session refresh
 * This should be used in middleware.ts at the root of your project
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createMiddlewareClient<Database>({
    req: request,
    res: response,
  });

  // Refresh session if expired
  await supabase.auth.getSession();

  return response;
}
