# Supabase Quick Start Guide

This guide will help you get started with Supabase in this Next.js application.

## Prerequisites

- Docker installed (for local development)
- Node.js 20.x or later

## Local Development Setup

### 1. Start Supabase

```bash
npm run supabase:start
```

This will start all Supabase services in Docker containers. The first time you run this, it will download the necessary Docker images (this may take a few minutes).

### 2. Get Your Credentials

After Supabase starts, you'll see output like this:

```
API URL: http://127.0.0.1:54321
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-above
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-above
```

### 4. Access Supabase Studio

Open http://localhost:54323 in your browser to access Supabase Studio. Here you can:

- View and edit data in your database
- Run SQL queries
- Manage authentication users
- View storage buckets
- Monitor real-time subscriptions

### 5. Start Your App

```bash
npm run dev
```

Your app is now running with Supabase!

## Using Supabase in Your Code

### Client Components

```tsx
"use client";

import { useSession, useSupabase } from "@/lib/supabase/auth-context";

export default function MyComponent() {
  const { user, isLoading, isAuthenticated } = useSession();
  const supabase = useSupabase();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;

  return <div>Welcome, {user.email}!</div>;
}
```

### Server Components

```tsx
import { getUser, createClient } from "@/lib/supabase/server";

export default async function ServerComponent() {
  const user = await getUser();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  const supabase = createClient();
  const { data } = await supabase.from("profiles").select("*");

  return <div>{/* Your component */}</div>;
}
```

## Database Schema

The project includes these tables:

### `profiles`

User profiles linked to auth.users

- `id` - UUID (primary key, references auth.users)
- `display_name` - Text
- `avatar_url` - Text
- `sharex_api_token_id` - UUID (nullable)
- `sharex_domain_preference` - Text (nullable)
- `created_at` - Timestamp
- `updated_at` - Timestamp

### `images`

Uploaded image metadata

- `id` - UUID (primary key)
- `owner_id` - UUID (references auth.users)
- `storage_key` - Text
- `filename` - Text
- `extension` - Text
- `size_bytes` - Integer
- `width` - Integer (nullable)
- `height` - Integer (nullable)
- `mime_type` - Text
- `checksum` - Text
- `visibility` - Enum (public/private/unlisted)
- `created_at` - Timestamp
- `updated_at` - Timestamp

### `api_tokens`

API tokens for ShareX and other integrations

- `id` - UUID (primary key)
- `owner_id` - UUID (references auth.users)
- `token_hash` - Text
- `description` - Text (nullable)
- `last_used_at` - Timestamp (nullable)
- `created_at` - Timestamp

## Protected Routes

The middleware automatically protects these routes:

- `/profile` - User profile page
- `/upload` - File upload page

To add more protected routes, edit `/middleware.ts`:

```typescript
const protectedRoutes = ["/profile", "/upload", "/your-new-route"];
```

## Type Generation

After making changes to your database schema:

```bash
npm run supabase:types
```

This regenerates TypeScript types from your database schema, providing full type safety for your queries.

## Stopping Supabase

```bash
npm run supabase:stop
```

## Resetting the Database

To reset your local database (reapply all migrations):

```bash
npm run supabase:reset
```

## Production Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be provisioned

### 2. Link Your Local Repository

```bash
npx supabase link --project-ref your-project-ref
```

You can find your project ref in the Supabase dashboard URL:
`https://app.supabase.com/project/[your-project-ref]`

### 3. Push Migrations

```bash
npm run supabase:migrate
```

This pushes all your local migrations to the remote project.

### 4. Update Environment Variables

In your production environment (Vercel, Netlify, etc.), set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
```

Get these values from your Supabase project settings → API.

## Troubleshooting

### Environment Variable Errors

If you see an error about missing environment variables:

```
❌ Environment variable validation failed:
  NEXT_PUBLIC_SUPABASE_URL: Required
```

Make sure you've created `.env.local` and copied the correct values from Supabase.

### Docker Errors

If Supabase won't start:

1. Make sure Docker is running
2. Try stopping and starting again:
   ```bash
   npm run supabase:stop
   npm run supabase:start
   ```

### Port Conflicts

If you get port conflict errors, check if another process is using ports 54321-54323:

```bash
lsof -i :54321
lsof -i :54322
lsof -i :54323
```

## Learn More

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [View usage examples](/lib/supabase/USAGE.md)
