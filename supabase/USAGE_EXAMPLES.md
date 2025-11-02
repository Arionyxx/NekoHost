# Supabase Usage Examples

This document provides code examples for common operations with the database schema.

## Setup

### Install Required Dependencies

```bash
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### Environment Variables

Ensure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Client Creation

### Client Components

```typescript
// lib/supabase/client.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/supabase/types";

export function createClient() {
  return createClientComponentClient<Database>();
}
```

### Server Components

```typescript
// lib/supabase/server.ts
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/supabase/types";

export function createClient() {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
}
```

## Authentication

### Sign Up

```typescript
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "password123",
  options: {
    data: {
      display_name: "John Doe",
      avatar_url: "https://example.com/avatar.jpg",
    },
  },
});

// Profile is automatically created via trigger
```

### Sign In

```typescript
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password123",
});
```

### Sign Out

```typescript
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const { error } = await supabase.auth.signOut();
```

### Get Current User

```typescript
import { createClient } from "@/lib/supabase/server";

const supabase = createClient();

const {
  data: { user },
} = await supabase.auth.getUser();
```

## Profiles

### Get User Profile

```typescript
import { createClient } from "@/lib/supabase/server";

const supabase = createClient();
const {
  data: { user },
} = await supabase.auth.getUser();

if (user) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
}
```

### Update Profile

```typescript
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const { data, error } = await supabase
  .from("profiles")
  .update({
    display_name: "New Name",
    avatar_url: "https://example.com/new-avatar.jpg",
    sharex_default_visibility: "public",
  })
  .eq("id", userId);
```

## Images

### Upload Image

```typescript
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient();
const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) throw new Error("Not authenticated");

const imageId = uuidv4();
const file = /* your File object */;
const filename = file.name.split(".").slice(0, -1).join(".");
const extension = file.name.split(".").pop() || "";

// 1. Create the image record first
const { data: imageRecord, error: dbError } = await supabase
  .from("images")
  .insert({
    id: imageId,
    owner_id: user.id,
    storage_key: `${user.id}/${imageId}.${extension}`,
    filename,
    extension,
    size_bytes: file.size,
    mime_type: file.type,
    checksum: "calculate_checksum_here",
    visibility: "public",
  })
  .select()
  .single();

if (dbError) throw dbError;

// 2. Upload to storage
const { data: storageData, error: storageError } = await supabase.storage
  .from("images")
  .upload(`${user.id}/${imageId}.${extension}`, file, {
    contentType: file.type,
    upsert: false,
  });

if (storageError) {
  // Rollback: delete the database record
  await supabase.from("images").delete().eq("id", imageId);
  throw storageError;
}

// 3. Get public URL
const {
  data: { publicUrl },
} = supabase.storage.from("images").getPublicUrl(storageData.path);

return { imageRecord, publicUrl };
```

### Get User's Images

```typescript
import { createClient } from "@/lib/supabase/server";

const supabase = createClient();
const {
  data: { user },
} = await supabase.auth.getUser();

const { data: images, error } = await supabase
  .from("images")
  .select("*")
  .eq("owner_id", user.id)
  .order("created_at", { ascending: false });
```

### Get Public Images

```typescript
import { createClient } from "@/lib/supabase/server";

const supabase = createClient();

const { data: images, error } = await supabase
  .from("images")
  .select("*")
  .eq("visibility", "public")
  .order("created_at", { ascending: false })
  .limit(50);
```

### Get Image with Public URL

```typescript
import { createClient } from "@/lib/supabase/server";

const supabase = createClient();

const { data: image, error } = await supabase
  .from("images")
  .select("*")
  .eq("id", imageId)
  .single();

if (image) {
  const {
    data: { publicUrl },
  } = supabase.storage.from("images").getPublicUrl(image.storage_key);

  return { ...image, publicUrl };
}
```

### Delete Image

```typescript
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// Deleting the image record will automatically delete the storage object via trigger
const { error } = await supabase.from("images").delete().eq("id", imageId);
```

### Update Image Visibility

```typescript
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const { data, error } = await supabase
  .from("images")
  .update({ visibility: "private" })
  .eq("id", imageId);
```

## API Tokens

### Create API Token

```typescript
import { createClient } from "@/lib/supabase/client";
import { createHash } from "crypto";

const supabase = createClient();
const {
  data: { user },
} = await supabase.auth.getUser();

// Generate a random token (in production, use a secure random generator)
const token = crypto.randomUUID();

// Hash the token before storing
const tokenHash = createHash("sha256").update(token).digest("hex");

const { data, error } = await supabase
  .from("api_tokens")
  .insert({
    owner_id: user.id,
    token_hash: tokenHash,
    description: "ShareX Upload Token",
  })
  .select()
  .single();

// Return the unhashed token to the user (only once!)
return { ...data, token };
```

### Verify API Token

```typescript
import { createClient } from "@/lib/supabase/server";
import { createHash } from "crypto";

const supabase = createClient();

// Hash the incoming token
const tokenHash = createHash("sha256").update(incomingToken).digest("hex");

// Look up the token
const { data: tokenRecord, error } = await supabase
  .from("api_tokens")
  .select("*")
  .eq("token_hash", tokenHash)
  .single();

if (tokenRecord) {
  // Update last_used_at
  await supabase
    .from("api_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", tokenRecord.id);

  return tokenRecord;
}

return null;
```

### List User's Tokens

```typescript
import { createClient } from "@/lib/supabase/server";

const supabase = createClient();
const {
  data: { user },
} = await supabase.auth.getUser();

const { data: tokens, error } = await supabase
  .from("api_tokens")
  .select("id, description, last_used_at, created_at")
  .eq("owner_id", user.id)
  .order("created_at", { ascending: false });
```

### Delete API Token

```typescript
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const { error } = await supabase.from("api_tokens").delete().eq("id", tokenId);
```

## Type-Safe Queries

### Using Table Types

```typescript
import { Database } from "@/supabase/types";

// Get the type for a table row
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Image = Database["public"]["Tables"]["images"]["Row"];
type ApiToken = Database["public"]["Tables"]["api_tokens"]["Row"];

// Get the type for inserts
type NewImage = Database["public"]["Tables"]["images"]["Insert"];

// Get the type for updates
type ImageUpdate = Database["public"]["Tables"]["images"]["Update"];
```

### Type-Safe Queries with Supabase

```typescript
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/supabase/types";

const supabase = createClient();

// The client is already typed with Database
const { data, error } = await supabase
  .from("images") // TypeScript knows this is a valid table
  .select("*") // TypeScript knows the available columns
  .eq("visibility", "public"); // TypeScript validates the column and value type

// data is typed as Image[] | null
```

## Real-time Subscriptions

### Subscribe to New Images

```typescript
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const channel = supabase
  .channel("public-images")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "images",
      filter: "visibility=eq.public",
    },
    (payload) => {
      console.log("New public image:", payload.new);
    }
  )
  .subscribe();

// Cleanup
channel.unsubscribe();
```

### Subscribe to Profile Changes

```typescript
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const {
  data: { user },
} = await supabase.auth.getUser();

const channel = supabase
  .channel(`profile-${user.id}`)
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "profiles",
      filter: `id=eq.${user.id}`,
    },
    (payload) => {
      console.log("Profile updated:", payload.new);
    }
  )
  .subscribe();

// Cleanup
channel.unsubscribe();
```

## Error Handling

```typescript
import { createClient } from "@/lib/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";

const supabase = createClient();

try {
  const { data, error } = await supabase
    .from("images")
    .select("*")
    .eq("id", imageId)
    .single();

  if (error) {
    // Handle specific error types
    if (error.code === "PGRST116") {
      console.error("No rows returned");
    } else {
      console.error("Database error:", error.message);
    }
    throw error;
  }

  return data;
} catch (err) {
  // Handle unexpected errors
  console.error("Unexpected error:", err);
  throw err;
}
```

## Pagination

```typescript
import { createClient } from "@/lib/supabase/server";

const supabase = createClient();

const pageSize = 20;
const page = 1;

const {
  data: images,
  error,
  count,
} = await supabase
  .from("images")
  .select("*", { count: "exact" })
  .eq("visibility", "public")
  .order("created_at", { ascending: false })
  .range((page - 1) * pageSize, page * pageSize - 1);

const totalPages = Math.ceil((count || 0) / pageSize);
```
