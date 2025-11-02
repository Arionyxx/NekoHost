# Supabase Client Utilities

These utility files provide type-safe Supabase clients for different Next.js contexts.

## Prerequisites

Before using these utilities, install the required packages:

```bash
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
```

## Files

### `client.ts`

Creates a Supabase client for use in **Client Components** (components marked with `"use client"`).

```typescript
import { createClient } from "@/lib/supabase/client";

// In a client component
const supabase = createClient();
```

### `server.ts`

Creates a Supabase client for use in **Server Components** and **Server Actions**.

```typescript
import { createClient } from "@/lib/supabase/server";

// In a server component or server action
const supabase = createClient();
```

### `middleware.ts`

Provides a helper function for handling authentication in Next.js middleware.

To use this:

1. Create or update `/middleware.ts` at the root of your project
2. Import and use the `updateSession` function

Example `/middleware.ts`:

```typescript
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: Request) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

## Type Safety

All clients are typed with the `Database` type from `@/supabase/types`, which is generated from your database schema.

This provides:

- Autocomplete for table names and columns
- Type checking for queries and mutations
- IntelliSense for available operations

## Examples

See `/supabase/USAGE_EXAMPLES.md` for comprehensive examples of using these clients.
