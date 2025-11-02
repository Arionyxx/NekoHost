-- Create storage bucket for images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'images',
  'images',
  true,
  52428800, -- 50MB in bytes
  array[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff'
  ]
);

-- RLS Policies for storage.objects (images bucket)
-- Anyone can view public images
create policy "Public images are viewable by everyone"
  on storage.objects
  for select
  using (bucket_id = 'images');

-- Authenticated users can upload images
create policy "Authenticated users can upload images"
  on storage.objects
  for insert
  with check (
    bucket_id = 'images' and
    auth.role() = 'authenticated'
  );

-- Users can update their own images
create policy "Users can update their own images"
  on storage.objects
  for update
  using (
    bucket_id = 'images' and
    auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own images
create policy "Users can delete their own images"
  on storage.objects
  for delete
  using (
    bucket_id = 'images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create function to clean up storage when image record is deleted
create or replace function public.delete_storage_object_on_image_delete()
returns trigger as $$
begin
  -- Delete the file from storage
  delete from storage.objects
  where bucket_id = 'images'
    and name = old.storage_key;
  
  return old;
end;
$$ language plpgsql security definer;

-- Add trigger to delete storage object when image record is deleted
create trigger on_image_deleted
  after delete on public.images
  for each row
  execute function public.delete_storage_object_on_image_delete();

-- Create function to prevent orphaned images (ensure record exists before storage upload completes)
-- Note: This is a helper function that should be called by the application
create or replace function public.validate_image_upload(
  p_storage_key text,
  p_owner_id uuid
)
returns boolean as $$
declare
  v_exists boolean;
begin
  -- Check if an image record exists for this storage key and owner
  select exists(
    select 1
    from public.images
    where storage_key = p_storage_key
      and owner_id = p_owner_id
  ) into v_exists;
  
  return v_exists;
end;
$$ language plpgsql security definer;
