# Supabase Client Usage Examples

This guide shows how to use the Supabase client utilities in different contexts.

## Table of Contents

- [Client Components](#client-components)
- [Server Components](#server-components)
- [Server Actions](#server-actions)
- [Route Handlers](#route-handlers)
- [Middleware](#middleware)

## Client Components

Client components run in the browser and can use React hooks.

### Using the useSession hook

```tsx
"use client";

import { useSession } from "@/lib/supabase/auth-context";
import { Loader } from "@/components/ui";

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useSession();

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <div>Please sign in to view your profile</div>;
  }

  return (
    <div>
      <h1>Profile</h1>
      <p>Email: {user.email}</p>
      <p>ID: {user.id}</p>
    </div>
  );
}
```

### Using the useSupabase hook

```tsx
"use client";

import { useState } from "react";
import { useSupabase } from "@/lib/supabase/auth-context";
import { Button } from "@/components/ui";

export default function SignOutButton() {
  const supabase = useSupabase();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setIsLoading(false);
  };

  return (
    <Button onClick={handleSignOut} disabled={isLoading}>
      {isLoading ? "Signing out..." : "Sign Out"}
    </Button>
  );
}
```

### Querying data

```tsx
"use client";

import { useEffect, useState } from "react";
import { useSupabase, useSession } from "@/lib/supabase/auth-context";
import type { Database } from "@/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function ProfileCard() {
  const supabase = useSupabase();
  const { user } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [user, supabase]);

  if (!profile) return <div>Loading profile...</div>;

  return (
    <div>
      <h2>{profile.display_name}</h2>
      <img src={profile.avatar_url || ""} alt="Avatar" />
    </div>
  );
}
```

## Server Components

Server components run on the server and can directly access the database.

### Getting the current user

```tsx
import { getUser } from "@/lib/supabase/server";

export default async function ServerProfilePage() {
  const user = await getUser();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <h1>Server Profile</h1>
      <p>Email: {user.email}</p>
      <p>ID: {user.id}</p>
    </div>
  );
}
```

### Querying data in a server component

```tsx
import { createClient } from "@/lib/supabase/server";

export default async function ImageGallery() {
  const supabase = createClient();

  const { data: images, error } = await supabase
    .from("images")
    .select("*")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching images:", error);
    return <div>Error loading images</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map((image) => (
        <div key={image.id}>
          <img src={image.storage_key} alt={image.filename} />
          <p>{image.filename}</p>
        </div>
      ))}
    </div>
  );
}
```

## Server Actions

Server actions are functions that run on the server and can be called from client components.

### Creating a profile

```tsx
"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  const user = await getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const displayName = formData.get("displayName") as string;

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: true };
}
```

### Using the server action in a client component

```tsx
"use client";

import { updateProfile } from "@/app/actions";
import { Button, Input } from "@/components/ui";

export default function ProfileForm() {
  return (
    <form action={updateProfile}>
      <Input name="displayName" label="Display Name" required />
      <Button type="submit">Update Profile</Button>
    </form>
  );
}
```

## Route Handlers

Route handlers are API endpoints in the App Router.

### Creating an API route

```tsx
// app/api/images/route.ts
import { createClient, getUser } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = createClient();

  const { data: images, error } = await supabase
    .from("images")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ images });
}

export async function POST(request: Request) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = createClient();
  const body = await request.json();

  const { data, error } = await supabase.from("images").insert({
    owner_id: user.id,
    filename: body.filename,
    storage_key: body.storage_key,
    mime_type: body.mime_type,
    size_bytes: body.size,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
```

## Middleware

The middleware is already configured at `/middleware.ts` to:

- Refresh expired auth sessions
- Protect authenticated routes (`/profile`, `/upload`)
- Redirect unauthenticated users to `/auth/sign-in`

To add more protected routes, edit the `protectedRoutes` array in `/middleware.ts`:

```typescript
const protectedRoutes = ["/profile", "/upload", "/dashboard", "/settings"];
```

To make a route public, simply remove it from the array or don't include it.

## Authentication Flow

### Sign Up

```tsx
"use client";

import { useState } from "react";
import { useSupabase } from "@/lib/supabase/auth-context";
import { Button, Input } from "@/components/ui";

export default function SignUpForm() {
  const supabase = useSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Check your email for the confirmation link!");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSignUp}>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        label="Email"
        required
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        label="Password"
        required
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Signing up..." : "Sign Up"}
      </Button>
    </form>
  );
}
```

### Sign In

```tsx
"use client";

import { useState } from "react";
import { useSupabase } from "@/lib/supabase/auth-context";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";

export default function SignInForm() {
  const supabase = useSupabase();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push("/profile");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSignIn}>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        label="Email"
        required
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        label="Password"
        required
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
```

## Type Safety

All Supabase clients are typed with the `Database` type from `@/supabase/types`. This provides:

- Autocomplete for table names and columns
- Type checking for queries and mutations
- IntelliSense for available operations

Example with full type safety:

```tsx
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/supabase/types";

type Image = Database["public"]["Tables"]["images"]["Row"];
type ImageInsert = Database["public"]["Tables"]["images"]["Insert"];
type ImageUpdate = Database["public"]["Tables"]["images"]["Update"];

async function getImages(): Promise<Image[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("images") // ✓ Autocomplete for table names
    .select("*")
    .eq("visibility", "public"); // ✓ Type-checked column names and values

  if (error) throw error;
  return data;
}
```
