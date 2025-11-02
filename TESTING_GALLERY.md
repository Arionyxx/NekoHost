# Gallery Display - Testing Guide

## Prerequisites

1. **Environment Setup**:

   ```bash
   # Copy environment variables
   cp .env.example .env.local
   ```

2. **Update `.env.local`** with your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Start Supabase** (if using local development):

   ```bash
   npm run supabase:start
   ```

4. **Install dependencies** (if not already done):

   ```bash
   npm install
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

## Test Plan

### 1. User Registration & Authentication

1. Navigate to `http://localhost:3000/auth/sign-up`
2. Create a new user account
3. Verify you're redirected and logged in
4. Check that the navigation bar shows your user info

### 2. Generate API Token for ShareX

1. Go to Settings page (`/settings`)
2. Scroll to "API Tokens" section
3. Enter a description: "Test Token"
4. Click "Generate Token"
5. **Save the token** (you won't be able to see it again)
6. Download the ShareX configuration file

### 3. Upload Images via ShareX

**Option A: Using ShareX (Windows)**

1. Open ShareX
2. Import the downloaded `.sxcu` configuration file
3. Set it as your default image uploader
4. Take a screenshot or upload an image
5. Verify the URL is copied to clipboard

**Option B: Using cURL (for testing)**

```bash
curl -X POST http://localhost:3000/api/sharex/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/test-image.jpg"
```

Expected response:

```json
{
  "success": true,
  "url": "http://localhost:54321/storage/v1/object/public/images/user-id/timestamp-filename.jpg",
  "filename": "filename.jpg"
}
```

### 4. Test Public Gallery (`/gallery`)

**Note**: Images must have `visibility: 'public'` to appear in the public gallery. By default, uploads are set to the user's `sharex_default_visibility` preference (default is 'private').

To make images public:

1. Go to Settings (`/settings`)
2. Set "Default Visibility" to "Public"
3. Upload a new image via ShareX or the upload page

**Then test:**

1. Navigate to `/gallery`
2. Verify uploaded image(s) appear in the grid
3. Test features:
   - ✅ Images display correctly with thumbnails
   - ✅ Hover over image to see overlay with metadata
   - ✅ Click "Copy link" button (appears on hover)
   - ✅ Verify toast notification shows "Link copied to clipboard!"
   - ✅ Paste the link in a new tab to verify it works
   - ✅ Click on the image to go to detail page (`/i/{id}`)
   - ✅ Scroll down to test infinite scroll pagination
   - ✅ Use search bar to filter images by filename or uploader

### 5. Test User Gallery (`/u/[username]`)

1. Navigate to your user gallery:
   - If your display name is "John Doe", go to `/u/john-doe`
   - Or click your profile link from the navigation
2. Verify your images appear (both public AND private)
3. Test features:
   - ✅ Images display in grid layout
   - ✅ Hover shows metadata overlay
   - ✅ Copy link button works
   - ✅ Visibility badges show for private images (yellow "private" badge)
   - ✅ Click image to view detail page
   - ✅ Search by filename
   - ✅ Infinite scroll works

### 6. Test Image Detail Page (`/i/[id]`)

1. Click on any image from gallery
2. Verify detail page loads with:
   - ✅ Full-size image display
   - ✅ Filename as title
   - ✅ Uploader name (clickable link)
   - ✅ Upload date
   - ✅ File size
   - ✅ Dimensions (width × height)
   - ✅ Format (JPEG, PNG, etc.)
   - ✅ Image ID
   - ✅ Visibility badge (public/private)
   - ✅ "View Full Size" button (opens in new tab)
   - ✅ "Copy Link" button (copies detail page URL)

### 7. Test Private Images

1. Go to Settings
2. Change "Default Visibility" to "Private"
3. Upload a new image
4. Verify:
   - ✅ Image appears in your user gallery (`/u/[username]`)
   - ✅ Image shows yellow "private" badge
   - ✅ Image DOES NOT appear in public gallery (`/gallery`)
   - ✅ Other users cannot see it (test with another account or incognito)
   - ✅ You can still view the detail page
   - ✅ Copy link button works

### 8. Test Empty States

**Empty Public Gallery:**

1. Delete all public images or use a fresh database
2. Navigate to `/gallery`
3. Verify empty state message shows: "No images yet"

**Empty User Gallery:**

1. Create a new user account with no uploads
2. Navigate to their gallery
3. Verify empty state shows appropriate message

### 9. Test Search Functionality

**Public Gallery:**

1. Upload several images with different names
2. Go to `/gallery`
3. Enter a filename in the search box
4. Verify only matching images appear
5. Clear search and verify all images reappear

**User Gallery:**

1. Go to your user gallery
2. Test search by filename
3. Verify filtering works correctly

### 10. Test Copy Link Functionality

This is the **new feature** added by this fix.

**Test on Gallery Pages:**

1. Go to `/gallery` or `/u/[username]`
2. Hover over any image card
3. Verify the copy link button appears (clipboard icon in top-right or top-left corner)
4. Click the copy button
5. Verify:
   - ✅ Toast notification appears: "Link copied to clipboard!"
   - ✅ The image detail page doesn't open (click is prevented)
   - ✅ Open a new tab and paste the link
   - ✅ Verify it navigates to `/i/{image-id}`
   - ✅ Verify the image detail page loads correctly

**Test position when visibility badge present:**

1. Go to your user gallery (must be logged in as owner)
2. Find a private image (has visibility badge in top-right)
3. Hover over the image
4. Verify:
   - ✅ Visibility badge is in top-right
   - ✅ Copy link button is in top-left (to avoid overlap)

### 11. Test Responsive Design

1. Resize browser window to different sizes
2. Verify:
   - ✅ Grid layout adjusts (uses auto-fill, minmax(280px, 1fr))
   - ✅ Images remain visible and properly sized on mobile
   - ✅ Hover overlay works on mobile (tap to show)
   - ✅ Copy button is accessible on touch devices

### 12. Test Performance

1. Upload 50+ images
2. Navigate to gallery pages
3. Verify:
   - ✅ Images load progressively
   - ✅ Infinite scroll triggers at the right time
   - ✅ No layout shift when images load
   - ✅ Thumbnail transformations work (600x600)

## Known Behavior

- **Default Visibility**: New uploads default to the user's `sharex_default_visibility` setting (usually 'private')
- **Public Gallery**: Only shows images with `visibility: 'public'`
- **User Gallery**: Shows all images (public and private) if viewing your own gallery, only public images if viewing someone else's
- **Thumbnail URLs**: Uses Supabase storage transformations for efficient loading (600x600, contain mode)
- **Copy Link**: Copies the image detail page URL (`/i/{id}`), not the direct storage URL

## Troubleshooting

### Images not appearing in gallery

1. Check database - verify images exist in `images` table:

   ```sql
   SELECT * FROM images;
   ```

2. Check visibility:

   ```sql
   SELECT id, filename, visibility FROM images;
   ```

3. Verify storage bucket is public
4. Check browser console for errors

### Copy link not working

1. Verify `useToast` is imported correctly
2. Check browser console for JavaScript errors
3. Ensure clipboard API is available (requires HTTPS or localhost)

### Images not loading

1. Check Supabase storage URL in environment variables
2. Verify storage bucket `images` exists
3. Check RLS policies on storage.objects table
4. Verify image files exist in storage

## Success Criteria

All the following should work:

- ✅ Public gallery displays all public images
- ✅ User gallery displays user's images (public + private for owner)
- ✅ Images display with proper thumbnails
- ✅ Metadata displays correctly (filename, size, date, dimensions)
- ✅ Hover overlay shows on all image cards
- ✅ **Copy link button works on all image cards**
- ✅ Toast notification shows when link copied
- ✅ Clicking images navigates to detail page
- ✅ Infinite scroll pagination works
- ✅ Search and filter work correctly
- ✅ Empty states display appropriate messages
- ✅ Private images are hidden from public view
- ✅ Responsive design works on all screen sizes
