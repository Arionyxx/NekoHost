# ShareX API Troubleshooting Guide

This document provides a comprehensive guide for debugging and fixing ShareX upload issues, particularly 500 errors in production (Vercel).

## Quick Diagnosis

When you encounter a 500 error, check the Vercel function logs for these specific error prefixes:

- `[ShareX API]` - Environment variable checks on module load
- `[ShareX Upload Error]` - Missing environment variables
- `[ShareX Token Validation Error]` - Token authentication issues
- `[ShareX Storage Upload Error]` - Supabase storage problems
- `[ShareX Database Insert Error]` - Database insertion failures
- `[ShareX File Upload Error]` - File processing errors
- `[ShareX Upload Unexpected Error]` - Unexpected exceptions

## Common Issues and Solutions

### 1. Missing Environment Variables (500 Error)

**Symptoms:**
```
Status: 500 Internal Server Error
Response: {"error":"Server configuration error"}
```

**Check Vercel Logs for:**
```
[ShareX API] Missing environment variables on module load: ["NEXT_PUBLIC_SUPABASE_URL"]
```
or
```
[ShareX Upload Error] Missing required environment variables: SUPABASE_SERVICE_ROLE_KEY
```

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the missing variables:
   - `NEXT_PUBLIC_SUPABASE_URL` (e.g., `https://your-project.supabase.co`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from Supabase project settings)
   - `SUPABASE_SERVICE_ROLE_KEY` (from Supabase project settings → API → service_role key)
3. Ensure variables are set for the correct environment (Production, Preview, Development)
4. Redeploy the application after adding variables

### 2. Token Authentication Errors (401 Error)

**Symptoms:**
```
Status: 401 Unauthorized
Response: {"error":"Invalid or expired token"}
```

**Check Vercel Logs for:**
```
[ShareX Token Validation Error] {
  code: "PGRST116",
  message: "The result contains 0 rows"
}
```

**Solutions:**

**A. Token Not Found in Database:**
- Verify the token exists in the `api_tokens` table
- Check that the token is properly hashed (SHA-256)
- Ensure ShareX is using the correct token in the Authorization header

**B. Database Connection Issues:**
- Verify the service role key has access to the `api_tokens` table
- Check RLS policies on the `api_tokens` table
- Ensure the service role key is not the anon key (they're different)

**C. Token Format Issues:**
- ShareX must send: `Authorization: Bearer YOUR_TOKEN_HERE`
- Token must be at least 32 characters long
- Token should be alphanumeric

### 3. Storage Upload Errors

**Symptoms:**
```
Status: 400 Bad Request
Response: {"error":"Upload failed: ..."}
```

**Check Vercel Logs for:**
```
[ShareX Storage Upload Error] {
  message: "new row violates row-level security policy",
  filename: "image.png"
}
```

**Solutions:**

**A. Storage Bucket Not Created:**
1. Go to Supabase Dashboard → Storage
2. Create a bucket named `images` if it doesn't exist
3. Set appropriate policies (see below)

**B. Storage Bucket Permissions:**
The `images` bucket needs these policies:

**INSERT Policy:**
```sql
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
TO authenticated, service_role
WITH CHECK (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**SELECT Policy (for public access):**
```sql
CREATE POLICY "Images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');
```

**C. Service Role Key Issues:**
- Ensure using `SUPABASE_SERVICE_ROLE_KEY` not `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- The service role key bypasses RLS but storage policies still apply
- Check that the storage bucket allows service role uploads

### 4. Database Insert Errors

**Symptoms:**
```
Status: 400 Bad Request  
Response: {"error":"Failed to save metadata: ..."}
```

**Check Vercel Logs for:**
```
[ShareX Database Insert Error] {
  message: "duplicate key value violates unique constraint",
  code: "23505"
}
```

**Solutions:**

**A. Duplicate Checksum:**
- The same file was uploaded before
- The `checksum` field has a unique constraint
- Either allow duplicates or use upsert logic

**B. Foreign Key Constraint:**
- Verify `owner_id` exists in the `profiles` table
- Check that user authentication created a profile
- Ensure the service role can write to the `images` table

**C. RLS Policy Issues:**
```sql
-- Allow service role to insert images
CREATE POLICY "Service role can insert images"
ON images FOR INSERT
TO service_role
WITH CHECK (true);

-- Or allow authenticated users
CREATE POLICY "Users can upload their own images"
ON images FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);
```

### 5. CORS Errors

**Symptoms:**
ShareX shows network error or "CORS policy" error

**Solution:**
The API route should automatically handle CORS for POST requests. If issues persist:

1. Check if the request is being blocked by middleware
2. Verify the API route is in `/app/api/sharex/upload/route.ts`
3. Ensure no middleware is blocking the route (check `middleware.ts`)

### 6. File Size or Type Errors

**Symptoms:**
```
Status: 400 Bad Request
Response: {"error":"File size exceeds 50MB limit"}
```
or
```
Response: {"error":"Invalid file type. Only images are allowed."}
```

**Solution:**
- Maximum file size: 50MB
- Allowed types: JPEG, PNG, GIF, WebP, SVG, BMP, TIFF
- To change limits, edit `MAX_FILE_SIZE` and `ALLOWED_MIME_TYPES` in the route

### 7. Rate Limiting (429 Error)

**Symptoms:**
```
Status: 429 Too Many Requests
Response: {"error":"Rate limit exceeded. Please try again later."}
```

**Solution:**
- Default limit: 100 uploads per hour per token
- Wait for the reset time (provided in response)
- To change limits, edit `RATE_LIMIT_CONFIG` in the route
- For production, consider using Redis-based rate limiting

## Debugging Steps

### Step 1: Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Go to "Functions" tab
4. Click on the `api/sharex/upload` function
5. Review the logs for the error prefixes mentioned above

### Step 2: Test with cURL

```bash
# Test authentication
curl -X POST https://your-app.vercel.app/api/sharex/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-image.png" \
  -v

# This will show:
# - HTTP status code
# - Response headers (including rate limit info)
# - Error message
```

### Step 3: Verify Environment Variables

```bash
# In Vercel Dashboard → Settings → Environment Variables, ensure:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... (different from anon key!)
```

### Step 4: Check Supabase Settings

1. **API Keys:**
   - Supabase Dashboard → Settings → API
   - Verify the `anon` and `service_role` keys match Vercel env vars

2. **Storage:**
   - Supabase Dashboard → Storage → images
   - Verify bucket exists and policies are correct

3. **Database:**
   - Supabase Dashboard → Table Editor → api_tokens
   - Verify your token exists with correct hash
   - Check `images` table exists with correct schema

4. **RLS Policies:**
   - Check both `api_tokens` and `images` tables
   - Ensure service role has necessary permissions

### Step 5: Test Locally

```bash
# Set up local environment
cp .env.example .env

# Add your production Supabase credentials to .env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Run locally
npm run dev

# Test upload
curl -X POST http://localhost:3000/api/sharex/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-image.png"
```

## ShareX Configuration

Make sure your ShareX is configured correctly:

**Custom Uploader Settings:**
```json
{
  "Version": "13.7.0",
  "Name": "Your App",
  "DestinationType": "ImageUploader",
  "RequestMethod": "POST",
  "RequestURL": "https://your-app.vercel.app/api/sharex/upload",
  "Headers": {
    "Authorization": "Bearer YOUR_TOKEN_HERE"
  },
  "Body": "MultipartFormData",
  "FileFormName": "file",
  "URL": "{json:url}",
  "ErrorMessage": "{json:error}"
}
```

## Enhanced Logging Features

The API route now includes:

1. **Module Load Checks:** Logs missing environment variables when the API route loads
2. **Request Logging:** Logs all incoming requests with method, URL, and auth status
3. **Detailed Error Context:** Every error includes:
   - Error message and code
   - Stack traces for unexpected errors
   - Relevant context (filename, user ID, etc.)
4. **Console Logs:** Critical errors are logged to both `logger` and `console` for Vercel
5. **Performance Tracking:** Request duration is logged for all requests

## Production Monitoring

### Setting Up Alerts

Consider setting up alerts for:
- 500 errors spike
- Missing environment variables
- Token validation failures
- Storage upload failures

### Log Aggregation

For production apps, consider:
- **Vercel Log Drains:** Stream logs to external services
- **Sentry:** Real-time error tracking (placeholder in code)
- **DataDog/New Relic:** Full application monitoring

## Support

If you continue to experience issues:

1. Gather the following information:
   - Vercel function logs (redact sensitive data)
   - ShareX error message
   - cURL test results
   - Supabase error logs

2. Check for known issues in the repository

3. Create a detailed issue report with the gathered information
