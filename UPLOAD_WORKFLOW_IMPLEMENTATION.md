# Upload Workflow Implementation

This document describes the complete implementation of the image upload workflow feature.

## Overview

The upload workflow provides a comprehensive image hosting solution with:

- Drag-and-drop multi-file upload interface
- Real-time progress tracking
- Concurrent upload throttling
- ShareX integration support
- Secure storage with Supabase

## Components Implemented

### 1. Upload Page (`/app/upload/page.tsx`)

A fully-featured client-side upload interface with:

**Features:**

- **Drag-and-drop area**: Responsive drop zone with visual feedback
- **File picker**: Multiple file selection via native file picker
- **Client-side validation**:
  - File type: Images only (JPEG, PNG, GIF, WebP, SVG, BMP, TIFF)
  - File size: Maximum 50MB per file
- **File previews**: Thumbnail previews using object URLs
- **Status indicators**: Color-coded badges (Pending, Uploading, Success, Error)
- **Progress tracking**: Per-file upload progress with animated progress bars
- **Concurrent upload control**: Maximum 3 simultaneous uploads with queuing
- **Error handling**: Graceful failure handling with retry buttons
- **Post-upload actions**:
  - Copy direct link
  - Copy markdown snippet
  - Copy HTML snippet
  - View image in new tab
- **Catppuccin styling**: Consistent color palette throughout

**Technical Details:**

- Uses XMLHttpRequest for upload progress tracking
- Implements queue-based throttling for concurrent uploads
- Cleans up object URLs to prevent memory leaks
- Uses React hooks for state management

### 2. Upload API Route (`/app/api/upload/route.ts`)

A Next.js Route Handler that processes file uploads:

**Features:**

- **Authentication**: Verifies Supabase auth before processing
- **Multi-file support**: Handles multiple files in a single request
- **Server-side validation**:
  - File size (50MB max)
  - MIME type checking
- **Storage integration**: Uploads to Supabase Storage (images bucket)
- **Database recording**: Stores metadata in `images` table
- **Image processing**:
  - Extracts dimensions for JPEG, PNG, and GIF
  - Generates SHA-256 checksums
  - Sanitizes filenames
- **Error handling**: Graceful error handling with rollback support
- **Multi-status responses**: Returns 207 for partial success scenarios

**Storage Structure:**

```
{user_id}/{timestamp}-{sanitized_filename}
```

**Response Format:**

```json
{
  "results": [
    {
      "success": true,
      "filename": "image.png",
      "url": "https://...",
      "publicUrl": "https://...",
      "imageId": "uuid"
    }
  ],
  "summary": {
    "total": 3,
    "successful": 2,
    "failed": 1
  }
}
```

### 3. Homepage Updates (`/app/page.tsx`)

Updated hero section and features to highlight:

**Changes:**

- New hero badge: "Fast & Secure Image Hosting"
- Updated headline: "Upload & Share Images Instantly"
- Upload CTA button with upload icon
- ShareX Setup button linking to settings
- Updated feature cards:
  1. **Drag & Drop Upload**: Multi-file upload with progress tracking
  2. **ShareX Integration**: Automated screenshot uploads
  3. **Secure & Private**: Supabase Storage with RLS
- Enhanced CTA section with upload and ShareX configuration options

### 4. E2E Tests (`/tests/upload.spec.ts`)

Comprehensive Playwright tests covering:

**Test Scenarios:**

- Display upload page elements
- File size and format limit display
- File selection via file input
- Multiple file selection
- Upload button visibility
- File removal functionality
- Status badge display
- File preview display
- Drag-and-drop interaction

**Multi-file Upload E2E Tests (skipped by default):**

- Complete upload flow with progress tracking
- Error handling with retry functionality
- Clipboard copy functionality

**Test Fixtures:**

- Created minimal valid PNG files in `/tests/fixtures/`
- Three test images: `test-image-1.png`, `test-image-2.png`, `test-image-3.png`

## Technical Architecture

### Upload Flow

1. **Client Selection**:
   - User drags files or uses file picker
   - Files validated on client
   - Preview thumbnails generated using object URLs
   - Files added to upload queue

2. **Upload Process**:
   - User clicks "Upload" button
   - Files marked as "pending"
   - Queue processor starts (max 3 concurrent)
   - Each file uploaded via FormData
   - Progress tracked via XMLHttpRequest events

3. **Server Processing**:
   - Auth verification
   - File validation
   - Upload to Supabase Storage
   - Dimension extraction (if applicable)
   - Checksum generation
   - Database record creation
   - Public URL generation

4. **Post-Upload**:
   - Success status shown
   - Copy buttons available
   - "View Image" CTA displayed
   - File can be cleared from list

### Throttling Strategy

The upload system implements a queue-based throttling mechanism:

```typescript
const MAX_CONCURRENT_UPLOADS = 3;

// Queue structure
uploadQueue: string[]  // File IDs
activeUploads: Set<string>  // Currently uploading file IDs

// Process queue
while (queue has items && active < MAX) {
  const nextId = queue.shift()
  activeUploads.add(nextId)
  uploadFile(nextId)
}
```

This ensures:

- No more than 3 simultaneous uploads
- Sequential processing of remaining files
- Automatic retry integration
- Graceful handling of failures

### Error Handling

**Client-side:**

- File validation errors shown via toast notifications
- Upload failures marked with red badge and error message
- Retry button available for failed uploads
- Network errors caught and displayed

**Server-side:**

- Authentication failures: 401 Unauthorized
- Validation errors: 400 Bad Request with detailed message
- Storage failures: Attempt cleanup and return error
- Database failures: Rollback storage upload
- Multi-file partial failures: 207 Multi-Status response

## Database Schema

### Images Table

```sql
images (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES auth.users,
  storage_key TEXT NOT NULL,
  filename TEXT NOT NULL,
  extension TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  width INTEGER,
  height INTEGER,
  mime_type TEXT NOT NULL,
  checksum TEXT NOT NULL,
  visibility visibility_type DEFAULT 'public',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

## Security Considerations

1. **Authentication**: All uploads require valid Supabase session
2. **File Validation**: Both client and server-side validation
3. **Storage RLS**: Row-level security on storage bucket
4. **Database RLS**: Row-level security on images table
5. **Filename Sanitization**: Remove special characters from filenames
6. **Checksum**: SHA-256 checksums for integrity verification

## Performance Optimizations

1. **Concurrent Upload Throttling**: Prevents overwhelming the server
2. **Progress Tracking**: XMLHttpRequest for real-time progress
3. **Object URL Cleanup**: Prevents memory leaks
4. **Efficient State Updates**: React state batching
5. **Image Dimension Extraction**: Binary parsing (no external dependencies)

## Future Enhancements

Potential improvements for future iterations:

1. **Image Compression**: Client-side image optimization before upload
2. **Thumbnail Generation**: Server-side thumbnail creation
3. **Batch Operations**: Bulk delete, bulk visibility changes
4. **Album/Collection Support**: Organize images into albums
5. **Advanced Search**: Search by filename, date, dimensions
6. **Analytics**: Upload statistics and usage tracking
7. **Rate Limiting**: Per-user upload limits
8. **CDN Integration**: CDN for faster image delivery
9. **Image Editing**: Basic cropping/rotation before upload
10. **ShareX Config Generator**: Auto-generate ShareX config files

## Testing

### Running Tests

```bash
# Run all E2E tests
npm run test

# Run tests in UI mode
npm run test:ui

# View test report
npm run test:report
```

### Test Coverage

- ✅ UI element visibility
- ✅ File selection and validation
- ✅ Multi-file handling
- ✅ Status indicators
- ✅ Drag-and-drop interactions
- ⏭️ Complete upload flow (requires live backend)
- ⏭️ Error handling with retry
- ⏭️ Clipboard operations

Note: E2E upload tests are skipped by default as they require a live Supabase instance.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Format code
npm run format

# Type checking
npx tsc --noEmit

# Run Playwright tests
npm run test
```

## Environment Requirements

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Browser Compatibility

The upload workflow uses modern browser APIs:

- File API
- Drag and Drop API
- XMLHttpRequest with progress events
- Clipboard API
- Web Crypto API (for checksums)

Supported browsers:

- Chrome/Edge 90+
- Firefox 90+
- Safari 14+

## Conclusion

This implementation provides a production-ready image upload workflow with:

- Modern, intuitive UI with Catppuccin theming
- Robust error handling and retry mechanisms
- Secure backend integration with Supabase
- Comprehensive validation and progress tracking
- Scalable architecture ready for future enhancements
