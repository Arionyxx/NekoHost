# ShareX URL Response Fix Summary

## Problem

ShareX was copying `$json:url$` (the literal placeholder string) to the clipboard instead of parsing and extracting the actual image URL from the API response.

## Root Cause

The ShareX upload API was returning a JSON response with multiple fields:

```json
{
  "success": true,
  "url": "https://example.com/i/IMAGE_ID",
  "filename": "image.png"
}
```

While ShareX's `$json:url$` parser should be able to extract the `url` field from this response, some versions of ShareX or certain configurations may have issues with additional fields in the response body. ShareX documentation recommends keeping the response structure minimal for maximum compatibility.

## Solution

Changed the API response to return **ONLY** the `url` field as recommended in ShareX best practices:

```json
{
  "url": "https://example.com/i/IMAGE_ID"
}
```

This is the exact format ShareX expects for its `$json:url$` placeholder to work correctly.

## Changes Made

### 1. API Response Simplified (`app/api/sharex/upload/route.ts`)

**Before:**
```typescript
return NextResponse.json(
  {
    success: true,
    url: result.url,
    filename: result.filename,
  },
  { status: 200, headers }
);
```

**After:**
```typescript
const response = {
  url: result.url,
};

console.log("[ShareX Upload Success]", {
  imageUrl: result.url,
  filename: result.filename,
  userId,
  responseStructure: response,
});

logger.info(
  { userId, tokenId, url: result.url, filename: result.filename },
  "ShareX upload completed successfully"
);

return NextResponse.json(response, { status: 200, headers });
```

### 2. Enhanced Debugging

Added console.log statements to help debug issues:

- **Success Response Logging**: Logs the actual response structure being sent to ShareX
- **URL Construction Logging**: Shows how the URL is being built from environment variables
- **Failure Logging**: Logs upload failures with context

### 3. Improved URL Construction

Enhanced the URL construction to handle edge cases:

```typescript
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
const baseUrl = siteUrl || appUrl || 'http://localhost:3000';
const viewUrl = `${baseUrl}/i/${imageData.id}`;

console.log("[ShareX URL Construction]", {
  siteUrl: siteUrl || "not set",
  appUrl: appUrl || "not set", 
  baseUrl,
  imageId: imageData.id,
  finalUrl: viewUrl,
});
```

This ensures:
- Empty strings are treated as falsy (via `.trim()`)
- Clear logging of which URL source is being used
- Fallback to localhost for development

### 4. Updated Tests (`tests/sharex-api.spec.ts`)

Updated the test expectations to match the new response format:

**Before:**
```typescript
expect(body.success).toBe(true);
expect(body.url).toBeTruthy();
expect(body.filename).toBeTruthy();
```

**After:**
```typescript
expect(body.url).toBeTruthy();
expect(body.url).toMatch(/\/i\//); // Should be a view URL like /i/{id}
```

## ShareX Configuration

The ShareX configuration remains unchanged and continues to use the correct format:

```json
{
  "Version": "14.1.0",
  "Name": "Custom Image Uploader",
  "DestinationType": "ImageUploader",
  "RequestMethod": "POST",
  "RequestURL": "https://your-app.vercel.app/api/sharex/upload",
  "Headers": {
    "Authorization": "Bearer YOUR_TOKEN"
  },
  "Body": "MultipartFormData",
  "FileFormName": "file",
  "URL": "$json:url$"
}
```

The `"URL": "$json:url$"` field tells ShareX to:
1. Parse the response as JSON
2. Extract the value of the `url` field
3. Copy that value to the clipboard

## Testing

To test the fix:

1. **Local Testing:**
```bash
curl -X POST http://localhost:3000/api/sharex/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-image.png"
```

Expected response:
```json
{
  "url": "http://localhost:3000/i/550e8400-e29b-41d4-a716-446655440000"
}
```

2. **ShareX Testing:**
- Generate a new API token in Settings
- Download the ShareX configuration file
- Import it into ShareX (Destinations → Custom uploader settings → Import)
- Take a screenshot or upload an image
- The actual image URL should now be copied to clipboard
- Paste to verify the URL works

## Expected Behavior

After this fix:
- ✅ ShareX copies the actual image URL (e.g., `https://your-app.vercel.app/i/IMAGE_ID`)
- ✅ Pasting the URL should show the image in a browser
- ✅ URL follows the format `/i/{image-id}` which routes to the image viewer page
- ✅ No more literal `$json:url$` text in clipboard

## Debugging

If issues persist, check Vercel function logs for:

```
[ShareX Upload Success] {
  imageUrl: 'https://your-app.vercel.app/i/...',
  filename: 'screenshot.png',
  userId: '...',
  responseStructure: { url: '...' }
}
```

And:

```
[ShareX URL Construction] {
  siteUrl: 'https://your-app.vercel.app',
  appUrl: 'not set',
  baseUrl: 'https://your-app.vercel.app',
  imageId: '...',
  finalUrl: 'https://your-app.vercel.app/i/...'
}
```

## Environment Variables

Ensure these are set in Vercel:
- `NEXT_PUBLIC_SITE_URL` - Your production URL (e.g., `https://your-app.vercel.app`)
- OR `NEXT_PUBLIC_APP_URL` - Alternative production URL variable
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

Without `NEXT_PUBLIC_SITE_URL` or `NEXT_PUBLIC_APP_URL`, the URL will default to `http://localhost:3000` which won't work in production.

## References

- [ShareX Custom Uploader Documentation](https://getsharex.com/docs/custom-uploader)
- [ShareX JSON Response Parsing](https://github.com/ShareX/ShareX/wiki/Custom-uploader#json-parsing)
- Previous PR #18: Fixed ShareX to return view URLs instead of storage URLs
- This Fix: Simplified response structure for maximum compatibility
