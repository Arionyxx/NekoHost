-- RLS Policies for profiles table
-- Users can view all profiles
create policy "Profiles are viewable by everyone"
  on public.profiles
  for select
  using (true);

-- Users can update their own profile
create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Users can insert their own profile (should be handled by trigger, but allowing for safety)
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- RLS Policies for images table
-- Public images are viewable by everyone
create policy "Public images are viewable by everyone"
  on public.images
  for select
  using (visibility = 'public');

-- Private images are only viewable by their owner
create policy "Private images are viewable by owner"
  on public.images
  for select
  using (auth.uid() = owner_id and visibility = 'private');

-- Users can insert their own images
create policy "Users can insert their own images"
  on public.images
  for insert
  with check (auth.uid() = owner_id);

-- Users can update their own images
create policy "Users can update their own images"
  on public.images
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Users can delete their own images
create policy "Users can delete their own images"
  on public.images
  for delete
  using (auth.uid() = owner_id);

-- RLS Policies for api_tokens table
-- Users can only view their own tokens
create policy "Users can view their own tokens"
  on public.api_tokens
  for select
  using (auth.uid() = owner_id);

-- Users can insert their own tokens
create policy "Users can insert their own tokens"
  on public.api_tokens
  for insert
  with check (auth.uid() = owner_id);

-- Users can update their own tokens
create policy "Users can update their own tokens"
  on public.api_tokens
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Users can delete their own tokens
create policy "Users can delete their own tokens"
  on public.api_tokens
  for delete
  using (auth.uid() = owner_id);
