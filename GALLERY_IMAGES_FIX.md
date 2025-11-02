# Gallery Images Not Displaying - Fix Summary

## Problem

Images uploaded via both the website upload form and ShareX were not appearing in the gallery views (`/gallery` and `/u/[username]`), even though they were successfully being saved to Supabase storage and the database.

## Root Causes Identified

### 1. **Foreign Key Relationship Issue**

The main issue was that the `images.owner_id` column referenced `auth.users(id)` while the gallery queries were trying to join with the `profiles` table using the foreign key syntax `profiles!images_owner_id_fkey`. 

Since both `images.owner_id` and `profiles.id` referenced `auth.users(id)` but there was no direct foreign key from `images.owner_id` to `profiles.id`, the join was failing silently or not returning the expected profile data.

### 2. **Auth State Timing Issue**

The gallery pages were attempting to fetch images immediately on mount, potentially before the Supabase client's authentication state was fully initialized. This could cause queries to fail or return incorrect results based on RLS policies.

### 3. **ShareX Visibility Default**

By design (not a bug), ShareX uploads default to 'private' visibility based on the user's profile preference (`sharex_default_visibility`, which defaults to 'private'). Private images don't appear in the public gallery or in other users' galleries, only in the owner's own gallery.

## Fixes Implemented

### 1. **Database Migration - Fixed Foreign Key Relationship**

Created migration `20250101000004_fix_images_profiles_relationship.sql`:

```sql
-- Drop the existing foreign key that referenced auth.users
ALTER TABLE public.images DROP CONSTRAINT IF EXISTS images_owner_id_fkey;

-- Add new foreign key that references profiles.id directly
ALTER TABLE public.images 
  ADD CONSTRAINT images_owner_id_fkey 
  FOREIGN KEY (owner_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;
```

This ensures that:
- The `images.owner_id` → `profiles.id` relationship is explicit
- The `profiles!images_owner_id_fkey` join syntax works correctly
- Profile data is properly fetched with image queries

### 2. **Gallery Query Improvements**

**Public Gallery (`/app/gallery/page.tsx`):**
- Added auth state checking before fetching images
- Only fetch images after auth state is initialized (not "loading")
- Added comprehensive error logging to debug query issues
- Added logging to show fetched image details

**User Gallery (`/app/u/[username]/page.tsx`):**
- Added same auth state checking
- Added comprehensive error logging
- Added logging to show fetched image details including visibility

### 3. **Upload Endpoint Logging**

Added logging to `/app/api/upload/route.ts` to track when images are successfully saved to the database, including all relevant fields (id, filename, visibility, storage_key, owner_id).

## Key Code Changes

### Gallery Page - Auth State Check

```typescript
// Added useSession hook
const { authState } = useSession();

// Wait for auth to be ready before fetching
useEffect(() => {
  if (authState !== "loading") {
    fetchImages(0, true);
  }
}, [fetchImages, authState]);
```

### Enhanced Error Logging

```typescript
if (error) {
  console.error("[Gallery] Query error:", {
    error,
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });
  throw error;
}
```

### Image Fetch Logging

```typescript
console.log("[Gallery] Fetched images:", {
  count: newImages.length,
  pageNum,
  hasData: !!data,
  firstImage: newImages[0] ? {
    id: newImages[0].id,
    filename: newImages[0].filename,
    visibility: 'public',
    storage_key: newImages[0].storage_key,
    owner_id: newImages[0].owner_id,
  } : null,
});
```

## Testing Checklist

After deploying these fixes, test the following scenarios:

### Website Upload
1. ✅ Upload an image via the website upload form
2. ✅ Image should immediately appear in `/gallery` (after refresh)
3. ✅ Image should appear in your user gallery `/u/[username]`
4. ✅ Check browser console for "[Upload] Image saved to database" log
5. ✅ Check browser console for "[Gallery] Fetched images" log showing your image

### ShareX Upload
1. ✅ Upload a screenshot via ShareX
2. ✅ If your `sharex_default_visibility` is 'public': image appears in `/gallery`
3. ✅ If your `sharex_default_visibility` is 'private': image only appears in your `/u/[username]` gallery
4. ✅ Check server logs for image save confirmation
5. ✅ Verify the visibility badge shows correct status in your gallery

### Gallery Display
1. ✅ Public gallery shows all public images
2. ✅ User gallery shows all of owner's images (public + private)
3. ✅ User gallery shows only public images when viewing another user
4. ✅ Profile information (display name) appears correctly on image cards
5. ✅ No errors in browser console about failed queries or missing data

## Debugging Tips

If images still don't appear after these fixes:

1. **Check browser console** for:
   - `[Gallery] Fetched images:` - Shows what the query returned
   - `[Gallery] Query error:` - Shows if the query failed
   - `[Upload] Image saved to database:` - Confirms image was saved

2. **Verify visibility settings**:
   - Website uploads should have `visibility: "public"`
   - ShareX uploads depend on user profile setting

3. **Check RLS policies** in Supabase:
   - Public images should be viewable by everyone (anonymous + authenticated)
   - Private images only viewable by owner

4. **Verify profile exists**:
   - User must have a profile record in `profiles` table
   - Profile is auto-created on signup via trigger

5. **Check foreign key**:
   - Run migration to ensure `images.owner_id` → `profiles.id` FK exists
   - Verify with: `\d+ images` in Supabase SQL editor

## Migration Instructions

To apply the database fix:

1. **Local Supabase**:
   ```bash
   npm run supabase:reset
   # or if DB already has data:
   npx supabase db push
   ```

2. **Production Supabase**:
   - Upload migration file via Supabase Dashboard > SQL Editor
   - Or use: `npx supabase db push` if linked to production

3. **Verify migration**:
   ```sql
   -- Check foreign key exists
   SELECT 
     conname as constraint_name,
     contype as constraint_type,
     pg_get_constraintdef(oid) as definition
   FROM pg_constraint
   WHERE conrelid = 'public.images'::regclass
     AND conname = 'images_owner_id_fkey';
   ```

## Expected Behavior After Fix

- **Website uploads**: Immediately visible in public gallery and user gallery
- **ShareX uploads (private)**: Only visible in owner's user gallery
- **ShareX uploads (public)**: Visible in both public gallery and user gallery
- **Profile data**: Correctly displays uploader name on all image cards
- **Console logs**: Clear debugging information about queries and results
- **No silent failures**: All query errors are logged to console
