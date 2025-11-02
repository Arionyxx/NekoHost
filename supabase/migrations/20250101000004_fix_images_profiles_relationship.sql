-- Drop the existing foreign key constraint on images.owner_id
ALTER TABLE public.images DROP CONSTRAINT IF EXISTS images_owner_id_fkey;

-- Add a new foreign key constraint that references profiles.id instead of auth.users
-- This allows for proper joins between images and profiles tables
ALTER TABLE public.images 
  ADD CONSTRAINT images_owner_id_fkey 
  FOREIGN KEY (owner_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- Add an index if it doesn't already exist (it should from previous migration)
CREATE INDEX IF NOT EXISTS images_owner_id_idx ON public.images(owner_id);
