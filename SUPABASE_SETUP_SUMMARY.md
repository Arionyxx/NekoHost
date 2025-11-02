# Supabase Schema Setup - Summary

This document summarizes the Supabase configuration and schema that has been added to this project.

## What Has Been Completed

### 1. Configuration Files

- **`supabase/config.toml`** - Supabase CLI configuration for local development
- **`.env.example`** - Updated with Supabase environment variables
- **`.gitignore`** - Updated to ignore `.supabase` directory
- **`.gitattributes`** - Added to ensure proper handling of SQL files

### 2. Database Migrations

Three SQL migration files have been created in `supabase/migrations/`:

#### Migration 1: Initial Schema (`20250101000001_initial_schema.sql`)

Creates the core database structure:

- **`profiles` table**: User profiles linked to `auth.users`
  - Fields: `id`, `display_name`, `avatar_url`, `sharex_default_visibility`, `sharex_auto_copy_link`
  - Auto-creates profile when user signs up (via trigger)
  - Auto-updates `updated_at` timestamp (via trigger)

- **`images` table**: Image metadata and ownership
  - Fields: `id`, `owner_id`, `storage_key`, `filename`, `extension`, `size_bytes`, `width`, `height`, `mime_type`, `checksum`, `visibility`
  - Supports public/private visibility
  - Includes performance indexes
  - Auto-updates `updated_at` timestamp (via trigger)

- **`api_tokens` table**: Hashed API tokens for ShareX integration
  - Fields: `id`, `owner_id`, `token_hash`, `description`, `last_used_at`, `created_at`
  - Stores only hashed tokens (never plaintext)
  - Includes performance indexes

#### Migration 2: RLS Policies (`20250101000002_rls_policies.sql`)

Defines Row Level Security policies for all tables:

- **Profiles**: Anyone can view, users can update their own
- **Images**: Public images viewable by all, private images only by owner, full CRUD for owners
- **API Tokens**: Full access limited to token owner only

#### Migration 3: Storage Setup (`20250101000003_storage_setup.sql`)

Configures Supabase Storage:

- **Images bucket**: Public bucket with authenticated uploads
  - 50MB file size limit
  - Supports: JPEG, PNG, GIF, WebP, SVG, BMP, TIFF
  - Public read access (controlled by RLS)
  - Authenticated write access (users can only access their own folders)

- **Automatic cleanup**: Trigger to delete storage object when image record is deleted
- **Upload validation**: Helper function to prevent orphaned files

### 3. TypeScript Types

- **`supabase/types/index.ts`** - Generated TypeScript types for type-safe database access
- Includes types for all tables, enums, and functions
- Provides `Row`, `Insert`, and `Update` types for each table

### 4. Client Utilities

Helper files for creating Supabase clients in different contexts:

- **`lib/supabase/client.ts`** - For Client Components
- **`lib/supabase/server.ts`** - For Server Components and Server Actions
- **`lib/supabase/middleware.ts`** - For Next.js middleware (session refresh)

**Note**: These utilities require installing `@supabase/supabase-js` and `@supabase/auth-helpers-nextjs`

### 5. Documentation

Comprehensive documentation has been added:

- **`README.md`** - Updated with Supabase setup instructions
- **`supabase/README.md`** - Supabase directory overview and getting started guide
- **`supabase/SCHEMA.md`** - Complete database schema documentation
- **`supabase/USAGE_EXAMPLES.md`** - Code examples for common operations
- **`supabase/SETUP_CHECKLIST.md`** - Step-by-step setup and testing checklist
- **`lib/supabase/README.md`** - Documentation for client utility files

### 6. Package Scripts

Added to `package.json`:

- `pnpm supabase:start` - Start local Supabase instance
- `pnpm supabase:stop` - Stop local Supabase instance
- `pnpm supabase:status` - Check status of Supabase services
- `pnpm supabase:reset` - Reset local database (reapply migrations)
- `pnpm supabase:types` - Regenerate TypeScript types
- `pnpm supabase:migrate` - Push migrations to remote

### 7. Additional Files

- **`supabase/seed/seed.sql`** - Seed data template for development
- **`middleware.ts.example`** - Example middleware configuration
- **`supabase/migrations/.templates/admin_roles_example.sql`** - Template for future admin functionality

## Next Steps

To use this Supabase setup, follow these steps:

### For Local Development

1. **Install required packages**:

   ```bash
   pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
   ```

2. **Install Docker** (if not already installed)

3. **Start Supabase locally**:

   ```bash
   pnpm supabase:start
   ```

4. **Update `.env.local`** with the keys from the output

5. **Access Supabase Studio** at http://localhost:54323

### For Production

1. **Create a Supabase project** at https://supabase.com

2. **Link your local project**:

   ```bash
   npx supabase link --project-ref <your-project-ref>
   ```

3. **Push migrations**:

   ```bash
   npx supabase db push
   ```

4. **Update environment variables** in your production environment

## Key Features

### Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Policies prevent unauthorized data access
- ✅ API tokens stored as hashes (not plaintext)
- ✅ Cascade deletes protect data integrity
- ✅ Storage access controlled per user

### Data Integrity

- ✅ Foreign key constraints ensure referential integrity
- ✅ Check constraints validate data (e.g., file size > 0)
- ✅ Unique constraints prevent duplicates
- ✅ Automatic cleanup of orphaned storage objects
- ✅ Automatic profile creation on user signup

### Performance

- ✅ Indexes on frequently queried columns
- ✅ Efficient RLS policies
- ✅ Proper data types for all fields

### Developer Experience

- ✅ Type-safe database access
- ✅ Comprehensive documentation
- ✅ Code examples for common operations
- ✅ Easy-to-use helper functions
- ✅ Local development workflow

## Database Schema Overview

```
auth.users (Supabase Auth)
    ↓ (1:1)
profiles
    ├── display_name
    ├── avatar_url
    └── sharex_* preferences

auth.users
    ↓ (1:many)
images
    ├── storage_key → storage.objects
    ├── visibility (public/private)
    └── metadata (size, dimensions, mime_type, etc.)

auth.users
    ↓ (1:many)
api_tokens
    ├── token_hash
    ├── description
    └── last_used_at

storage.buckets/images
    └── Public bucket with RLS-controlled access
```

## Support & Resources

- Documentation: See `/supabase/README.md`
- Examples: See `/supabase/USAGE_EXAMPLES.md`
- Schema: See `/supabase/SCHEMA.md`
- Checklist: See `/supabase/SETUP_CHECKLIST.md`
- Official Docs: https://supabase.com/docs

## Future Enhancements

Template migrations have been provided for:

- Admin roles and permissions (see `supabase/migrations/.templates/admin_roles_example.sql`)

Additional features that could be added:

- Image comments/likes
- Collections/albums
- Image sharing/collaboration
- Advanced search/filtering
- Analytics and usage tracking
- Rate limiting
- Image processing (thumbnails, optimization)
