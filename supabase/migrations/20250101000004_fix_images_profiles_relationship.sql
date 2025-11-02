-- Drop the existing foreign key constraint on images.owner_id
ALTER TABLE public.images DROP CONSTRAINT IF EXISTS images_owner_id_fkey;

-- Add foreign key constraint from images.owner_id to profiles.id
-- This fixes the "Could not find a relationship between 'images' and 'profiles'" error
-- and enables proper joins between images and profiles tables
ALTER TABLE public.images
ADD CONSTRAINT images_owner_id_fkey 
FOREIGN KEY (owner_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- Ensure index exists for better query performance
-- Note: The initial schema creates this as images_owner_id_idx
CREATE INDEX IF NOT EXISTS images_owner_id_idx ON public.images(owner_id);
