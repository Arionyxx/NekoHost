# Supabase Setup Checklist

Use this checklist to ensure your Supabase setup is complete.

## Initial Setup

### 1. Install Dependencies

- [ ] Install Supabase CLI dev dependency (already in package.json)
- [ ] Install Supabase client libraries:
  ```bash
  pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
  ```

### 2. Environment Configuration

- [ ] Copy `.env.example` to `.env.local`
- [ ] Update Supabase environment variables in `.env.local`
  - For local development, these will be provided when you run `pnpm supabase:start`
  - For production, get these from your Supabase project dashboard

### 3. Local Development Setup

- [ ] Install Docker Desktop (required for local Supabase)
- [ ] Start local Supabase instance:
  ```bash
  pnpm supabase:start
  ```
- [ ] Copy the API URL and keys from the output to `.env.local`
- [ ] Verify Supabase Studio is accessible at http://localhost:54323

## Database Schema

- [x] Initial schema migration created (`20250101000001_initial_schema.sql`)
- [x] RLS policies migration created (`20250101000002_rls_policies.sql`)
- [x] Storage setup migration created (`20250101000003_storage_setup.sql`)
- [x] TypeScript types generated (`supabase/types/index.ts`)

## Tables & Features

### Profiles Table

- [x] Table created with proper schema
- [x] RLS policies configured
- [x] Auto-create profile on user signup (trigger)
- [x] Auto-update `updated_at` timestamp (trigger)

### Images Table

- [x] Table created with proper schema
- [x] RLS policies for visibility control
- [x] Indexes for performance
- [x] Auto-delete storage object on record delete (trigger)
- [x] Helper function to validate uploads

### API Tokens Table

- [x] Table created with proper schema
- [x] RLS policies for token owner access
- [x] Indexes for performance

### Storage

- [x] Images bucket created
- [x] 50MB file size limit configured
- [x] Allowed MIME types configured
- [x] RLS policies for bucket access

## Client Setup

### Supabase Client Utilities

- [x] Client component client (`lib/supabase/client.ts`)
- [x] Server component client (`lib/supabase/server.ts`)
- [x] Middleware helper (`lib/supabase/middleware.ts`)
- [ ] Root middleware configured (rename `middleware.ts.example` to `middleware.ts`)

### Usage Examples

- [x] Usage examples documented (`supabase/USAGE_EXAMPLES.md`)
- [x] Schema documentation (`supabase/SCHEMA.md`)

## Testing

### Local Testing

- [ ] Start local Supabase: `pnpm supabase:start`
- [ ] Verify all migrations applied successfully
- [ ] Test user signup and profile creation
- [ ] Test image upload and storage
- [ ] Test RLS policies (try accessing other users' private data)
- [ ] Test API token creation and validation
- [ ] Stop local Supabase: `pnpm supabase:stop`

### Remote Testing (Production)

- [ ] Create Supabase project at https://supabase.com
- [ ] Link local project: `npx supabase link --project-ref <your-project-ref>`
- [ ] Push migrations: `npx supabase db push`
- [ ] Update environment variables with production values
- [ ] Test signup/login flow
- [ ] Test image upload and storage
- [ ] Verify RLS policies work in production

## Documentation

- [x] Main README updated with Supabase setup instructions
- [x] Environment variables documented
- [x] Migration workflow documented
- [x] Supabase-specific README created
- [x] Schema documentation created
- [x] Usage examples created

## Security Checklist

- [x] RLS enabled on all tables
- [x] API tokens stored as hashes (not plaintext)
- [x] Cascade deletes configured for user data
- [x] Storage policies enforce user ownership
- [x] Service role key kept secret (not in git)
- [ ] Verify anon key is safe to expose (it is - it's meant to be public)
- [ ] Review RLS policies before production deployment

## Production Deployment

### Pre-deployment

- [ ] Review all RLS policies
- [ ] Test with production data (if migrating)
- [ ] Set up database backups in Supabase dashboard
- [ ] Configure custom domain (optional)
- [ ] Set up email templates for auth (optional)

### Deployment

- [ ] Deploy application with production environment variables
- [ ] Verify auth flow works
- [ ] Verify storage uploads work
- [ ] Monitor error logs
- [ ] Test edge cases (permissions, errors, etc.)

### Post-deployment

- [ ] Set up monitoring/alerting
- [ ] Document any production-specific configurations
- [ ] Train team on migration workflow
- [ ] Set up regular database backups

## Troubleshooting

If you encounter issues:

1. **Local Supabase won't start**
   - Check Docker is running
   - Check ports 54321-54324 are available
   - Try `npx supabase stop --no-backup` then `pnpm supabase:start`

2. **Migrations failing**
   - Check SQL syntax
   - Verify migration order
   - Check for conflicts with existing data
   - Try `pnpm supabase:reset` to start fresh

3. **RLS policies blocking access**
   - Test with service role key to verify data exists
   - Check policy definitions
   - Verify user authentication state
   - Use Supabase Studio to test queries

4. **Types out of sync**
   - Run `pnpm supabase:types` to regenerate
   - Ensure local Supabase is running
   - Check TypeScript errors in your editor

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
