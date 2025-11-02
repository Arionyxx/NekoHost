# Quick Start Guide - Supabase Setup

This is a quick reference guide to get you started with Supabase in this project.

## Step 1: Install Dependencies

```bash
pnpm install
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
```

## Step 2: Set Up Local Supabase

### Install Docker

- Mac/Windows: [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Linux: [Docker Engine](https://docs.docker.com/engine/install/)

### Start Supabase

```bash
pnpm supabase:start
```

This will output something like:

```
API URL: http://127.0.0.1:54321
anon key: eyJhb...
service_role key: eyJhb...
```

## Step 3: Configure Environment

Create `.env.local`:

```bash
cp .env.example .env.local
```

Update it with the keys from Step 2:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb... # from supabase:start output
SUPABASE_SERVICE_ROLE_KEY=eyJhb... # from supabase:start output
```

## Step 4: Access Supabase Studio

Open http://localhost:54323 in your browser to:

- View database tables
- Run SQL queries
- Manage storage
- View API documentation

## Step 5: Start Development

```bash
pnpm dev
```

Your app is now running at http://localhost:3000 with Supabase connected!

## Common Commands

```bash
# Supabase
pnpm supabase:start       # Start local Supabase
pnpm supabase:stop        # Stop local Supabase
pnpm supabase:reset       # Reset database (reapply migrations)
pnpm supabase:types       # Regenerate TypeScript types

# Development
pnpm dev                  # Start Next.js dev server
pnpm build                # Build for production
pnpm lint                 # Run ESLint
pnpm format               # Format code with Prettier
```

## What's Included

### Database Tables

- **profiles** - User profiles with ShareX preferences
- **images** - Image metadata and ownership
- **api_tokens** - Hashed API tokens for ShareX integration

### Storage

- **images bucket** - 50MB limit, supports common image formats

### TypeScript Types

- All database types in `supabase/types/index.ts`
- Auto-generated from schema
- Type-safe queries and mutations

### Client Utilities

- `lib/supabase/client.ts` - For Client Components
- `lib/supabase/server.ts` - For Server Components
- `lib/supabase/middleware.ts` - For Next.js middleware

## Next Steps

1. **Read the documentation**:
   - `supabase/README.md` - Supabase overview
   - `supabase/SCHEMA.md` - Database schema details
   - `supabase/USAGE_EXAMPLES.md` - Code examples

2. **Test the setup**:
   - Create a test user via Supabase Studio
   - Upload a test image
   - Verify RLS policies work

3. **Deploy to production**:
   - Create Supabase project at https://supabase.com
   - Link: `npx supabase link --project-ref <ref>`
   - Push migrations: `npx supabase db push`
   - Update production environment variables

## Troubleshooting

### Supabase won't start

```bash
# Stop and clear volumes
npx supabase stop --no-backup

# Start fresh
pnpm supabase:start
```

### Types are outdated

```bash
# Regenerate types
pnpm supabase:types
```

### Need to reset database

```bash
# Reapply all migrations
pnpm supabase:reset
```

## Getting Help

- **Documentation**: See `supabase/README.md`
- **Examples**: See `supabase/USAGE_EXAMPLES.md`
- **Schema**: See `supabase/SCHEMA.md`
- **Official Docs**: https://supabase.com/docs
