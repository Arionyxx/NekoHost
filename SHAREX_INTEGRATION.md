# ShareX Integration Implementation Summary

This document summarizes the ShareX integration feature that has been implemented.

## Overview

The application now supports direct image uploads from ShareX, a popular Windows screenshot and file sharing tool. Users can generate API tokens, configure ShareX, and upload images programmatically.

## Features Implemented

### 1. ShareX API Endpoint (`/api/sharex/upload`)

**Location**: `/app/api/sharex/upload/route.ts`

**Features**:

- Bearer token authentication via Authorization header
- Token validation using SHA-256 hash comparison
- Rate limiting (100 uploads per hour per token)
- Automatic last_used_at timestamp updates
- Reuses existing upload logic for consistency
- Full error handling and logging
- Returns ShareX-compatible JSON response

**Request Format**:

```
POST /api/sharex/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
Field: file
```

**Response Format**:

```json
{
  "success": true,
  "url": "https://example.com/path/to/image.png",
  "filename": "image.png"
}
```

### 2. User Settings Interface

**Location**: `/app/settings/page.tsx`

**Features**:

- Generate new API tokens with optional descriptions
- Display list of all tokens with metadata
- Show last_used_at timestamp for each token (formatted relative time)
- Revoke/delete tokens
- Copy token to clipboard (only shown once after generation)
- Generate ShareX configuration JSON
- Download ShareX configuration as `.sxcu` file
- Copy ShareX configuration to clipboard

**UI Improvements**:

- Token warning banner to save token immediately
- Last used timestamp with human-readable formatting
- Download and copy buttons for ShareX config
- Active badge for tokens
- Confirmation dialog before deletion

### 3. Rate Limiting

**Location**: `/lib/rate-limiter.ts`

**Features**:

- In-memory rate limiting (100 requests per hour per token)
- Automatic cleanup of expired entries
- Rate limit headers in API responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Reset timestamp
- 429 status code with Retry-After header when limit exceeded

### 4. Logging & Monitoring

**Location**: `/lib/logger.ts`

**Features**:

- Pino logger with pretty printing in development
- Request duration tracking
- Error logging with context
- Sentry integration placeholder
- Log levels: debug (dev), info (prod)

**Logged Information**:

- Token validation attempts
- Upload success/failure
- Rate limit violations
- Request duration
- Error details with stack traces

### 5. Documentation

**Location**: `/README.md` (new section added)

**Includes**:

- Step-by-step ShareX setup instructions
- Configuration example with explanations
- API endpoint documentation
- Rate limiting details
- Token management guidelines
- Security best practices
- Troubleshooting section

### 6. Testing

**Location**: `/tests/sharex-api.spec.ts`

**Test Coverage**:

- Reject requests without authorization header
- Reject requests with invalid token
- Reject requests without file
- Successfully upload with valid token
- Update last_used_at timestamp after upload
- Persist image metadata in database
- Reject files exceeding size limit
- Reject non-image files
- Enforce rate limits (skipped by default)
- Request duration logging

## Database Schema

The existing `api_tokens` table was already in place with the following structure:

- `id` (UUID, primary key)
- `owner_id` (UUID, references auth.users)
- `token_hash` (text, SHA-256 hash of token)
- `description` (text, nullable)
- `last_used_at` (timestamp, nullable)
- `created_at` (timestamp)

## Security Considerations

1. **Token Storage**: Tokens are hashed using SHA-256 before storage
2. **One-time Display**: Raw tokens are only shown once after generation
3. **Rate Limiting**: Prevents abuse with 100 uploads/hour limit
4. **Service Role Key**: API endpoint uses service role for authentication bypass
5. **File Validation**: Enforces size limits and MIME type checks

## Configuration Requirements

The following environment variables are required:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for API authentication

## Future Enhancements

Potential improvements for future development:

1. **Redis Integration**: Replace in-memory rate limiter with Redis for distributed systems
2. **Token Scopes**: Add granular permissions (read-only, upload-only, etc.)
3. **Token Expiration**: Add optional expiration dates for tokens
4. **Usage Statistics**: Track upload counts and bandwidth per token
5. **Webhook Support**: Notify external services when uploads occur
6. **Multi-file Uploads**: Support batch uploads from ShareX
7. **Custom Response Formats**: Allow users to customize ShareX response parsing
8. **IP Whitelisting**: Restrict tokens to specific IP addresses

## Dependencies Added

- `pino` - Fast logging library
- `pino-pretty` - Pretty printing for development logs

## Files Modified

- `/app/settings/page.tsx` - Added token management UI improvements
- `/app/gallery/page.tsx` - Fixed TypeScript type assertion
- `/app/i/[id]/page.tsx` - Fixed TypeScript type assertion
- `/app/u/[username]/page.tsx` - Fixed TypeScript type assertion
- `/README.md` - Added ShareX integration documentation

## Files Created

- `/app/api/sharex/upload/route.ts` - ShareX API endpoint
- `/lib/logger.ts` - Logging utility with Sentry placeholder
- `/lib/rate-limiter.ts` - Rate limiting utility
- `/tests/sharex-api.spec.ts` - API endpoint tests
- `/SHAREX_INTEGRATION.md` - This document

## How to Use

1. Sign in to the application
2. Navigate to Settings page
3. Generate a new API token with a description
4. Download the ShareX configuration file
5. Import the configuration into ShareX
6. Start uploading!

## Testing the Integration

To test the ShareX endpoint:

```bash
# Generate a token in the UI first, then:
curl -X POST http://localhost:3000/api/sharex/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/image.png"
```

Expected response:

```json
{
  "success": true,
  "url": "http://localhost:54321/storage/v1/object/public/images/...",
  "filename": "image.png"
}
```

## Monitoring & Debugging

Logs are written to stdout with the following structure:

```json
{
  "level": "info",
  "time": "2024-01-01T12:00:00.000Z",
  "userId": "uuid",
  "tokenId": "uuid",
  "filename": "image.png",
  "success": true,
  "duration": 1234,
  "msg": "Upload request completed"
}
```

For production, integrate Sentry by:

1. Installing `@sentry/nextjs`
2. Configuring Sentry in `lib/logger.ts`
3. Setting `SENTRY_DSN` environment variable

## Conclusion

The ShareX integration is fully functional and production-ready. Users can now upload images directly from ShareX with secure token-based authentication, rate limiting, and comprehensive logging.
