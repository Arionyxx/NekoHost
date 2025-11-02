-- Example migration for adding admin roles (TEMPLATE - DO NOT RUN)
-- This is a template for future use when admin functionality is needed

-- Add role column to profiles
-- alter table public.profiles add column role text default 'user' not null;
-- alter table public.profiles add constraint profiles_role_check check (role in ('user', 'admin'));

-- Create helper function to check if user is admin
-- create or replace function public.is_admin(user_id uuid)
-- returns boolean as $$
-- begin
--   return exists (
--     select 1 from public.profiles
--     where id = user_id and role = 'admin'
--   );
-- end;
-- $$ language plpgsql security definer;

-- Update profiles RLS policies to allow admins to manage all profiles
-- create policy "Admins can update all profiles"
--   on public.profiles
--   for update
--   using (public.is_admin(auth.uid()))
--   with check (public.is_admin(auth.uid()));

-- create policy "Admins can delete profiles"
--   on public.profiles
--   for delete
--   using (public.is_admin(auth.uid()));

-- Similar policies can be added for images and api_tokens tables
