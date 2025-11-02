-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create custom types
create type visibility_type as enum ('public', 'private');

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  sharex_default_visibility visibility_type default 'private',
  sharex_auto_copy_link boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Add RLS to profiles
alter table public.profiles enable row level security;

-- Create images table
create table public.images (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users on delete cascade not null,
  storage_key text not null,
  filename text not null,
  extension text not null,
  size_bytes bigint not null,
  width integer,
  height integer,
  mime_type text not null,
  checksum text not null,
  visibility visibility_type default 'private' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  constraint images_storage_key_unique unique (storage_key),
  constraint images_size_check check (size_bytes > 0)
);

-- Add indexes for images table
create index images_owner_id_idx on public.images(owner_id);
create index images_created_at_idx on public.images(created_at desc);
create index images_visibility_idx on public.images(visibility);

-- Add RLS to images
alter table public.images enable row level security;

-- Create api_tokens table
create table public.api_tokens (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users on delete cascade not null,
  token_hash text not null,
  description text,
  last_used_at timestamptz,
  created_at timestamptz default now() not null,
  
  constraint api_tokens_token_hash_unique unique (token_hash)
);

-- Add indexes for api_tokens table
create index api_tokens_owner_id_idx on public.api_tokens(owner_id);
create index api_tokens_token_hash_idx on public.api_tokens(token_hash);

-- Add RLS to api_tokens
alter table public.api_tokens enable row level security;

-- Create function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add triggers for updated_at
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

create trigger handle_images_updated_at
  before update on public.images
  for each row
  execute function public.handle_updated_at();

-- Create function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Add trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
