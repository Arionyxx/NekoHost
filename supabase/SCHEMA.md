# Database Schema Documentation

This document describes the database schema for the image hosting application.

## Tables

### `profiles`

User profiles linked to authentication users.

| Column                      | Type            | Description                                                   |
| --------------------------- | --------------- | ------------------------------------------------------------- |
| `id`                        | UUID            | Primary key, references `auth.users.id`                       |
| `display_name`              | TEXT            | User's display name (nullable)                                |
| `avatar_url`                | TEXT            | URL to user's avatar image (nullable)                         |
| `sharex_default_visibility` | visibility_type | Default visibility for ShareX uploads (`public` or `private`) |
| `sharex_auto_copy_link`     | BOOLEAN         | Whether to auto-copy link after upload (default: true)        |
| `created_at`                | TIMESTAMPTZ     | Profile creation timestamp                                    |
| `updated_at`                | TIMESTAMPTZ     | Last update timestamp (auto-updated)                          |

**Indexes:**

- Primary key on `id`

**RLS Policies:**

- `Profiles are viewable by everyone` - Anyone can select profiles
- `Users can update their own profile` - Users can only update their own profile
- `Users can insert their own profile` - Users can only insert their own profile

**Triggers:**

- `handle_profiles_updated_at` - Automatically updates `updated_at` on row update
- `on_auth_user_created` - Automatically creates a profile when a user signs up

---

### `images`

Image metadata and ownership information.

| Column        | Type            | Description                                    |
| ------------- | --------------- | ---------------------------------------------- |
| `id`          | UUID            | Primary key (auto-generated)                   |
| `owner_id`    | UUID            | References `auth.users.id`, owner of the image |
| `storage_key` | TEXT            | Unique path to file in storage bucket          |
| `filename`    | TEXT            | Original filename (without extension)          |
| `extension`   | TEXT            | File extension (e.g., "png", "jpg")            |
| `size_bytes`  | BIGINT          | File size in bytes (must be > 0)               |
| `width`       | INTEGER         | Image width in pixels (nullable)               |
| `height`      | INTEGER         | Image height in pixels (nullable)              |
| `mime_type`   | TEXT            | MIME type (e.g., "image/png")                  |
| `checksum`    | TEXT            | File checksum for integrity verification       |
| `visibility`  | visibility_type | Image visibility (`public` or `private`)       |
| `created_at`  | TIMESTAMPTZ     | Upload timestamp                               |
| `updated_at`  | TIMESTAMPTZ     | Last update timestamp (auto-updated)           |

**Indexes:**

- Primary key on `id`
- `images_owner_id_idx` on `owner_id`
- `images_created_at_idx` on `created_at DESC`
- `images_visibility_idx` on `visibility`

**Constraints:**

- `images_storage_key_unique` - Storage key must be unique
- `images_size_check` - Size must be greater than 0

**RLS Policies:**

- `Public images are viewable by everyone` - Public images can be selected by anyone
- `Private images are viewable by owner` - Private images can only be selected by owner
- `Users can insert their own images` - Users can only insert images with their own `owner_id`
- `Users can update their own images` - Users can only update their own images
- `Users can delete their own images` - Users can only delete their own images

**Triggers:**

- `handle_images_updated_at` - Automatically updates `updated_at` on row update
- `on_image_deleted` - Automatically deletes the storage object when image record is deleted

---

### `api_tokens`

API tokens for programmatic access (e.g., ShareX integration).

| Column         | Type        | Description                                    |
| -------------- | ----------- | ---------------------------------------------- |
| `id`           | UUID        | Primary key (auto-generated)                   |
| `owner_id`     | UUID        | References `auth.users.id`, owner of the token |
| `token_hash`   | TEXT        | Hashed version of the API token (unique)       |
| `description`  | TEXT        | Optional description of the token's purpose    |
| `last_used_at` | TIMESTAMPTZ | Timestamp of last token usage (nullable)       |
| `created_at`   | TIMESTAMPTZ | Token creation timestamp                       |

**Indexes:**

- Primary key on `id`
- `api_tokens_owner_id_idx` on `owner_id`
- `api_tokens_token_hash_idx` on `token_hash`

**Constraints:**

- `api_tokens_token_hash_unique` - Token hash must be unique

**RLS Policies:**

- `Users can view their own tokens` - Users can only select their own tokens
- `Users can insert their own tokens` - Users can only insert tokens with their own `owner_id`
- `Users can update their own tokens` - Users can only update their own tokens
- `Users can delete their own tokens` - Users can only delete their own tokens

---

## Enums

### `visibility_type`

Image visibility options.

- `public` - Image is publicly accessible
- `private` - Image is only accessible to the owner

---

## Storage

### `images` Bucket

Configuration:

- **Public**: Yes (but access controlled via RLS)
- **File size limit**: 50MB (52,428,800 bytes)
- **Allowed MIME types**:
  - image/jpeg
  - image/jpg
  - image/png
  - image/gif
  - image/webp
  - image/svg+xml
  - image/bmp
  - image/tiff

**RLS Policies:**

- `Public images are viewable by everyone` - Anyone can select from the bucket
- `Authenticated users can upload images` - Only authenticated users can insert
- `Users can update their own images` - Users can only update files in their own folder
- `Users can delete their own images` - Users can only delete files in their own folder

**Storage Organization:**
Images are stored with a path structure: `{user_id}/{filename}.{extension}`

---

## Functions

### `handle_updated_at()`

Trigger function that automatically updates the `updated_at` column to the current timestamp when a row is updated.

**Returns:** TRIGGER

---

### `handle_new_user()`

Trigger function that automatically creates a profile record when a new user signs up via `auth.users`.

**Returns:** TRIGGER

---

### `delete_storage_object_on_image_delete()`

Trigger function that automatically deletes the associated storage object when an image record is deleted, preventing orphaned files.

**Returns:** TRIGGER

---

### `validate_image_upload(p_storage_key TEXT, p_owner_id UUID)`

Helper function to validate that an image record exists before allowing a storage upload to complete.

**Arguments:**

- `p_storage_key` - The storage key to validate
- `p_owner_id` - The owner's UUID

**Returns:** BOOLEAN - true if a matching image record exists

---

## Relationships

```
auth.users (Supabase Auth)
    ↓ (1:1)
profiles
    ↓ (1:many)
images

auth.users
    ↓ (1:many)
api_tokens
```

---

## Migration Files

The schema is defined in the following migration files (in order):

1. `20250101000001_initial_schema.sql` - Creates tables, indexes, and basic triggers
2. `20250101000002_rls_policies.sql` - Defines Row Level Security policies
3. `20250101000003_storage_setup.sql` - Creates storage bucket and storage RLS policies

---

## Security Considerations

1. **API Tokens**: Tokens are stored as hashes, never in plaintext. Applications should hash incoming tokens before querying the database.

2. **RLS Policies**: All tables have Row Level Security enabled to prevent unauthorized access.

3. **Cascade Deletes**: Deleting a user will cascade delete all their profiles, images, and API tokens.

4. **Storage Cleanup**: Deleting an image record automatically removes the file from storage.

5. **Image Privacy**: Private images are only accessible to their owners, enforced at both the database and storage levels.

---

## Common Queries

### Get user's profile

```sql
SELECT * FROM profiles WHERE id = auth.uid();
```

### Get all public images

```sql
SELECT * FROM images WHERE visibility = 'public' ORDER BY created_at DESC;
```

### Get user's images

```sql
SELECT * FROM images WHERE owner_id = auth.uid() ORDER BY created_at DESC;
```

### Create a new API token

```sql
INSERT INTO api_tokens (owner_id, token_hash, description)
VALUES (auth.uid(), 'hashed_token_here', 'My ShareX token');
```
