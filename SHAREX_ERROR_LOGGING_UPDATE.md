# ShareX API Error Logging Enhancement

## Summary

Enhanced the ShareX upload API endpoint (`/api/sharex/upload`) with comprehensive error logging and environment variable verification to help debug 500 errors in production (Vercel).

## Changes Made

### 1. Environment Variable Check on Module Load

Added automatic environment variable verification when the API route module loads:

```typescript
// Verify environment variables on module load
const checkEnvironmentVariables = () => {
  const requiredVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
  
  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
  
  if (missing.length > 0) {
    console.error("[ShareX API] Missing environment variables on module load:", missing);
    logger.error({ missingVars: missing }, "ShareX API missing environment variables");
  } else {
    console.log("[ShareX API] Environment variables check passed");
  }
};

// Run check on module load
checkEnvironmentVariables();
```

**Benefits:**
- Immediately identifies missing environment variables when the function cold-starts
- Visible in Vercel function logs before any requests are processed
- Helps catch configuration issues early

### 2. Enhanced Environment Variable Error Logging

Improved the environment variable check in the request handler:

```typescript
if (!supabaseUrl || !supabaseServiceKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseServiceKey) missingVars.push("SUPABASE_SERVICE_ROLE_KEY");
  
  const errorMessage = `Missing required environment variables: ${missingVars.join(", ")}`;
  
  // Log to both logger and console for Vercel function logs
  logger.error({
    missingVariables: missingVars,
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseServiceKey: !!supabaseServiceKey,
  }, errorMessage);
  
  console.error("[ShareX Upload Error]", errorMessage, {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? "SET" : "MISSING",
    SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey ? "SET" : "MISSING",
  });
  
  captureException(new Error(errorMessage));
  
  return NextResponse.json(
    { error: "Server configuration error" },
    { status: 500 }
  );
}
```

**Benefits:**
- Specifically identifies which environment variables are missing
- Logs to both structured logger (pino) and console (for Vercel)
- Doesn't expose sensitive values, only presence/absence
- Clear error prefix `[ShareX Upload Error]` for easy searching

### 3. Request Logging

Added logging for all incoming requests:

```typescript
logger.info({
  method: request.method,
  url: request.url,
  hasAuthHeader: !!request.headers.get("authorization"),
}, "ShareX upload request received");
```

**Benefits:**
- Track request patterns
- Identify authentication header issues
- Monitor API usage

### 4. Enhanced Token Validation Error Logging

Improved error logging for token validation failures:

```typescript
if (tokenError || !tokenData) {
  // Log detailed error for debugging
  logger.warn(
    { 
      tokenHash: tokenHash.substring(0, 8),
      errorCode: tokenError?.code,
      errorMessage: tokenError?.message,
      errorDetails: tokenError?.details,
    },
    "Invalid or expired token"
  );
  
  // Log to console for Vercel logs
  if (tokenError) {
    console.error("[ShareX Token Validation Error]", {
      code: tokenError.code,
      message: tokenError.message,
      hint: tokenError.hint,
    });
  }
  
  return NextResponse.json(
    { error: "Invalid or expired token" },
    { status: 401 }
  );
}
```

**Benefits:**
- Identifies database connection issues
- Shows Supabase error codes and hints
- Helps diagnose RLS policy problems
- First 8 chars of token hash for correlation

### 5. Storage Upload Error Logging

Enhanced logging for storage upload failures:

```typescript
if (uploadError) {
  logger.error({ 
    error: uploadError, 
    filename, 
    storageKey,
    fileSize: file.size,
    mimeType: file.type,
  }, "Storage upload failed");
  
  console.error("[ShareX Storage Upload Error]", {
    message: uploadError.message,
    filename,
    storageKey,
  });
  
  return {
    success: false,
    filename,
    error: `Upload failed: ${uploadError.message}`,
  };
}
```

**Benefits:**
- Identifies storage bucket configuration issues
- Shows file context for debugging
- Helps diagnose permission problems

### 6. Database Insert Error Logging

Enhanced logging for database insertion failures:

```typescript
if (dbError) {
  logger.error({ 
    error: dbError, 
    filename,
    storageKey,
    errorCode: dbError.code,
    errorDetails: dbError.details,
  }, "Database insert failed");
  
  console.error("[ShareX Database Insert Error]", {
    message: dbError.message,
    code: dbError.code,
    hint: dbError.hint,
    filename,
  });
  
  // Cleanup uploaded file
  await supabase.storage.from("images").remove([storageKey]);
  return {
    success: false,
    filename,
    error: `Failed to save metadata: ${dbError.message}`,
  };
}
```

**Benefits:**
- Shows PostgreSQL error codes for constraint violations
- Includes database hints for quick diagnosis
- Helps identify RLS policy issues

### 7. Comprehensive Catch Block Logging

Improved the main catch block error logging:

```typescript
} catch (error) {
  const duration = Date.now() - startTime;
  
  // Enhanced error logging for debugging
  const errorDetails = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    name: error instanceof Error ? error.name : undefined,
    duration,
  };
  
  logger.error({ error: errorDetails }, "Unexpected error in ShareX upload");
  
  // Log to console for Vercel function logs
  console.error("[ShareX Upload Unexpected Error]", {
    message: errorDetails.message,
    name: errorDetails.name,
    duration: errorDetails.duration,
    stack: errorDetails.stack,
  });
  
  captureException(
    error instanceof Error ? error : new Error("Unknown error"),
    { endpoint: "/api/sharex/upload", ...errorDetails }
  );

  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
```

**Benefits:**
- Captures full stack traces
- Includes request duration for performance issues
- Logs to both structured logger and console
- Provides context for Sentry (when configured)

### 8. File Upload Error Logging

Enhanced error logging in the `uploadFile` function:

```typescript
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  logger.error({ 
    error, 
    filename,
    errorMessage,
    errorStack,
  }, "Error during file upload");
  
  console.error("[ShareX File Upload Error]", {
    filename,
    message: errorMessage,
    stack: errorStack,
  });
  
  return {
    success: false,
    filename,
    error: errorMessage,
  };
}
```

**Benefits:**
- Catches file processing errors
- Helps diagnose file corruption or format issues

## Error Prefixes for Searching Vercel Logs

All errors now use consistent prefixes for easy searching:

| Prefix | Location | Purpose |
|--------|----------|---------|
| `[ShareX API]` | Module load | Environment variable checks |
| `[ShareX Upload Error]` | Request handler | Configuration errors |
| `[ShareX Token Validation Error]` | Token validation | Authentication issues |
| `[ShareX Storage Upload Error]` | Storage upload | Storage bucket issues |
| `[ShareX Database Insert Error]` | Database insert | Database/RLS issues |
| `[ShareX File Upload Error]` | File processing | File handling errors |
| `[ShareX Upload Unexpected Error]` | Catch block | Unexpected exceptions |

## How to Use in Production

### 1. Viewing Logs in Vercel

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Navigate to "Functions" tab
4. Click on `api/sharex/upload` function
5. Search for error prefixes (e.g., `[ShareX Upload Error]`)

### 2. Debugging a 500 Error

When you see a 500 error:

1. **Check environment variables:**
   ```
   Search logs for: [ShareX API] Missing environment variables
   ```

2. **Check token validation:**
   ```
   Search logs for: [ShareX Token Validation Error]
   ```

3. **Check storage issues:**
   ```
   Search logs for: [ShareX Storage Upload Error]
   ```

4. **Check database issues:**
   ```
   Search logs for: [ShareX Database Insert Error]
   ```

5. **Check unexpected errors:**
   ```
   Search logs for: [ShareX Upload Unexpected Error]
   ```

### 3. Common Fixes

**Missing Environment Variables:**
```bash
# In Vercel Dashboard → Settings → Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

**Token Validation Issues:**
- Verify token exists in `api_tokens` table
- Check token is properly hashed (SHA-256)
- Ensure service role key is correct

**Storage Issues:**
- Create `images` bucket in Supabase
- Set appropriate storage policies
- Verify service role has upload permissions

**Database Issues:**
- Check `images` table exists
- Verify RLS policies allow service role
- Ensure foreign key constraints are met

## Testing

Test the enhanced logging locally:

```bash
# Test with missing env vars
unset SUPABASE_SERVICE_ROLE_KEY
curl -X POST http://localhost:3000/api/sharex/upload \
  -H "Authorization: Bearer test" \
  -F "file=@test.png"

# Should see: [ShareX Upload Error] Missing required environment variables
```

Test in production:

```bash
# Test with real token
curl -X POST https://your-app.vercel.app/api/sharex/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.png" \
  -v
```

## Documentation

See `SHAREX_TROUBLESHOOTING.md` for comprehensive troubleshooting guide.

## Security Note

All error logging is designed to:
- ✅ Log enough detail for debugging
- ✅ Include error codes and hints
- ✅ Show presence/absence of configuration
- ❌ NOT expose sensitive values (tokens, keys)
- ❌ NOT expose internal system details to API responses
- ❌ NOT log full authorization headers

## Next Steps

1. Deploy the changes to Vercel
2. Check Vercel function logs for `[ShareX API] Environment variables check passed`
3. Test ShareX upload
4. Review logs if errors occur
5. Fix configuration based on specific error messages

## Monitoring Recommendations

For production applications, consider:

1. **Set up Sentry** - Uncomment the Sentry code in `lib/logger.ts`
2. **Configure Log Drains** - Stream Vercel logs to external service
3. **Set up Alerts** - Monitor for 500 error spikes
4. **Use Redis** - For distributed rate limiting
5. **Performance Monitoring** - Track upload durations
