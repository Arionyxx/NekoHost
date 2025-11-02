-- This seed file is for local development only
-- It creates test users and sample data

-- Note: In a real environment, users would be created through auth.users
-- This is just for testing purposes

-- Insert a test profile (assumes a user with this UUID exists or will be created)
-- You can create test users via Supabase Studio or the auth API
-- This is just an example of what profiles data looks like

-- Example comment showing the structure:
-- insert into public.profiles (id, display_name, avatar_url, sharex_default_visibility, sharex_auto_copy_link)
-- values (
--   '00000000-0000-0000-0000-000000000001'::uuid,
--   'Test User',
--   'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
--   'public',
--   true
-- );

-- Example image record (would be created after actual file upload):
-- insert into public.images (id, owner_id, storage_key, filename, extension, size_bytes, width, height, mime_type, checksum, visibility)
-- values (
--   '10000000-0000-0000-0000-000000000001'::uuid,
--   '00000000-0000-0000-0000-000000000001'::uuid,
--   '00000000-0000-0000-0000-000000000001/sample-image.png',
--   'sample-image',
--   'png',
--   1024000,
--   1920,
--   1080,
--   'image/png',
--   'abc123def456',
--   'public'
-- );
