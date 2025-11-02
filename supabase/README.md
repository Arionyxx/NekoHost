# Supabase Configuration

This directory contains the Supabase configuration and database migrations for the project.

## Directory Structure

```
supabase/
├── config.toml           # Supabase CLI configuration
├── migrations/           # Database migration files (SQL)
│   ├── 20250101000001_initial_schema.sql
│   ├── 20250101000002_rls_policies.sql
│   └── 20250101000003_storage_setup.sql
├── seed/                 # Seed data for development (optional)
│   └── seed.sql
├── types/                # Generated TypeScript types
│   └── index.ts
├── SCHEMA.md            # Database schema documentation
└── README.md            # This file
```

## Getting Started

### Prerequisites

- Docker Desktop (for local Supabase instance)
- Node.js 20.x or later
- pnpm package manager

### Local Development

1. **Start Supabase locally:**

   ```bash
   pnpm supabase:start
   ```

   This command will:
   - Pull the required Docker images
   - Start PostgreSQL, PostgREST, GoTrue, Storage, and other services
   - Apply all migrations from the `migrations/` directory
   - Display the local API URL and API keys

2. **Access Supabase Studio:**

   ```bash
   open http://localhost:54323
   ```

   Use Supabase Studio to:
   - Browse tables and data
   - Run SQL queries
   - View API documentation
   - Manage storage buckets
   - Test authentication

3. **Update your `.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-from-supabase-start>
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key-from-supabase-start>
   ```

### Linking to a Remote Project

1. **Create a new Supabase project:**
   - Visit https://app.supabase.com
   - Create a new project
   - Wait for it to finish initializing

2. **Link your local project:**

   ```bash
   npx supabase link --project-ref <your-project-ref>
   ```

   Find your project ref in the Supabase dashboard URL:
   `https://app.supabase.com/project/<your-project-ref>`

3. **Push migrations to remote:**

   ```bash
   npx supabase db push
   ```

4. **Update production environment variables:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   ```

## Working with Migrations

### Creating a New Migration

1. **Generate a new migration file:**

   ```bash
   npx supabase migration new <migration_name>
   ```

   This creates a new file in `supabase/migrations/` with a timestamp prefix.

2. **Write your SQL:**
   Edit the generated file and add your SQL statements.

3. **Apply the migration locally:**

   ```bash
   pnpm supabase:reset
   ```

4. **Regenerate TypeScript types:**

   ```bash
   pnpm supabase:types
   ```

5. **Commit the migration:**
   ```bash
   git add supabase/migrations/<new_migration_file>
   git commit -m "Add migration: <description>"
   ```

### Migration Best Practices

- **One logical change per migration** - Don't mix unrelated changes
- **Use transactions** - Wrap DDL statements in transactions when possible
- **Include rollback comments** - Document how to reverse the migration
- **Test locally first** - Always test migrations locally before pushing to production
- **Use IF EXISTS/IF NOT EXISTS** - Make migrations idempotent when possible

### Example Migration

```sql
-- Create a new table
create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  image_id uuid references public.images on delete cascade not null,
  author_id uuid references auth.users on delete cascade not null,
  content text not null,
  created_at timestamptz default now() not null
);

-- Add RLS
alter table public.comments enable row level security;

-- Add policies
create policy "Comments are viewable by everyone"
  on public.comments for select using (true);

create policy "Authenticated users can create comments"
  on public.comments for insert
  with check (auth.uid() = author_id);
```

## TypeScript Types

The `types/index.ts` file contains TypeScript types generated from the database schema. These types are used throughout the application for type safety.

### Regenerating Types

After creating or modifying migrations, regenerate the types:

```bash
pnpm supabase:types
```

This command:

1. Connects to the local Supabase instance
2. Introspects the database schema
3. Generates TypeScript types
4. Writes them to `supabase/types/index.ts`

### Using Types in Your Application

```typescript
import { Database } from "@/supabase/types";

// Table row types
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Image = Database["public"]["Tables"]["images"]["Row"];

// Insert types (for creating new records)
type NewImage = Database["public"]["Tables"]["images"]["Insert"];

// Update types (for updating records)
type ImageUpdate = Database["public"]["Tables"]["images"]["Update"];
```

## Seed Data

The `seed/seed.sql` file contains sample data for local development. This data is automatically loaded when you run `pnpm supabase:reset`.

To add more seed data, edit `seed/seed.sql` and reset the database.

## Configuration

The `config.toml` file contains settings for the local Supabase instance:

- **Database port**: 54322
- **API port**: 54321
- **Studio port**: 54323
- **Storage size limit**: 50MB per file
- **JWT expiry**: 3600 seconds (1 hour)

You can customize these settings as needed for your local development environment.

## Troubleshooting

### Supabase won't start

- **Check Docker**: Ensure Docker is running and has enough resources
- **Port conflicts**: Check if ports 54321-54324 are already in use
- **Reset volumes**: Run `npx supabase stop --no-backup` and then `pnpm supabase:start`

### Migrations fail to apply

- **Check syntax**: Ensure your SQL is valid
- **Check dependencies**: Make sure migrations are in the correct order
- **Reset database**: Run `pnpm supabase:reset` to reapply all migrations

### Types are out of sync

- **Regenerate types**: Run `pnpm supabase:types`
- **Check connection**: Ensure local Supabase is running
- **Manual fix**: If auto-generation fails, update types manually

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
