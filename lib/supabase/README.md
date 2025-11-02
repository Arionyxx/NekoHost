# Supabase Client Utilities

These utility files provide type-safe Supabase clients for different Next.js contexts.

## Prerequisites

The required packages are already installed:

- `@supabase/supabase-js` - Core Supabase client
- `@supabase/ssr` - Server-side rendering helpers
- `zod` - Environment variable validation

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
import { createClient, getUser, getSession } from "@/lib/supabase/server";

// In a server component or server action
const supabase = createClient();

// Get the current authenticated user
const user = await getUser();

// Get the current session
const session = await getSession();
```

### `auth-context.tsx`

Provides React context and hooks for client-side authentication state.

**Hooks:**

- `useSession()` - Access user, session, and loading state
- `useSupabase()` - Access the Supabase client instance

**Example usage:**

```typescript
import { useSession, useSupabase } from "@/lib/supabase/auth-context";

function MyComponent() {
  const { user, isLoading, isAuthenticated } = useSession();
  const supabase = useSupabase();

  if (isLoading) return <Loader />;
  if (!isAuthenticated) return <SignIn />;

  return <div>Hello {user?.email}</div>;
}
```

The `AuthProvider` is already configured in the root layout, so all components have access to these hooks.

### `middleware.ts`

Provides a helper function for handling authentication in Next.js middleware.

The middleware is configured at `/middleware.ts` and automatically:

- Refreshes expired auth sessions
- Protects authenticated routes (`/profile`, `/upload`)
- Redirects unauthenticated users to sign-in

## Environment Variables

Required environment variables (validated at runtime using Zod):

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

If these are missing or invalid, the app will throw an error with a helpful message.

## Type Safety

All clients are typed with the `Database` type from `@/supabase/types`, which is generated from your database schema.

This provides:

- Autocomplete for table names and columns
- Type checking for queries and mutations
- IntelliSense for available operations

## Auth State Management

The app uses a React Context (`AuthProvider`) to manage authentication state globally:

- **Loading**: Initial state while checking authentication
- **Authenticated**: User is signed in
- **Unauthenticated**: User is not signed in

The context automatically subscribes to auth state changes and updates all components.

## Protected Routes

The middleware protects the following routes:

- `/profile` - User profile page
- `/upload` - File upload page

Unauthenticated users are redirected to `/auth/sign-in` with a `redirectTo` parameter.

## Examples

See `/supabase/USAGE_EXAMPLES.md` for comprehensive examples of using these clients.
