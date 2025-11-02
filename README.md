# Next.js 14 App with Catppuccin Macchiato Theme

A modern Next.js 14 application with TypeScript, Tailwind CSS, and the beautiful Catppuccin Macchiato color palette.

## Features

- ⚡️ **Next.js 14** with App Router
- 🎨 **TypeScript** for type safety
- 💅 **Tailwind CSS** for styling
- 🌈 **Catppuccin Macchiato** color palette
- 🔐 **Supabase Authentication** - Full auth integration with React hooks
- 🎯 **UI Components** - Button, Card, Input, Badge, Skeleton/Loader
- 🔧 **Developer Tools** - ESLint, Prettier, Husky, lint-staged
- 📱 **Responsive Design** with mobile-friendly navigation
- 🛡️ **Protected Routes** - Middleware-based route protection
- ✅ **Environment Validation** - Runtime validation with Zod

## Getting Started

### Prerequisites

- Node.js 20.x or later (see `.nvmrc`)
- pnpm (recommended) or npm/yarn

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd <your-repo-name>
```

2. Install dependencies:

```bash
pnpm install
```

3. Copy the environment variables:

```bash
cp .env.example .env.local
```

4. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

## Project Structure

```
.
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with AuthProvider
│   ├── page.tsx           # Home page
│   ├── upload/            # Upload page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # UI primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   └── Skeleton.tsx
│   └── Navigation.tsx    # Navigation component
├── lib/                   # Utilities and shared code
│   ├── env.ts            # Environment validation (Zod)
│   └── supabase/         # Supabase client utilities
│       ├── client.ts     # Browser client
│       ├── server.ts     # Server client + helpers
│       ├── middleware.ts # Middleware helper
│       ├── auth-context.tsx # React context & hooks
│       ├── index.ts      # Central exports
│       ├── README.md     # Documentation
│       └── USAGE.md      # Usage examples
├── supabase/              # Supabase configuration
│   ├── migrations/       # Database migrations
│   ├── types/           # Generated TypeScript types
│   └── config.toml      # Supabase configuration
├── middleware.ts          # Next.js middleware (auth)
├── .husky/               # Git hooks
├── tailwind.config.ts    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## UI Components

### Button

```tsx
import { Button } from "@/components/ui";

<Button variant="primary" size="md">
  Click me
</Button>;
```

Variants: `primary`, `secondary`, `outline`  
Sizes: `sm`, `md`, `lg`

### Card

```tsx
import { Card } from "@/components/ui";

<Card hover>
  <h2>Card Title</h2>
  <p>Card content</p>
</Card>;
```

### Input

```tsx
import { Input } from "@/components/ui";

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  error="Invalid email"
/>;
```

### Badge

```tsx
import { Badge } from "@/components/ui";

<Badge variant="success">Active</Badge>;
```

Variants: `default`, `success`, `warning`, `error`, `info`, `accent`

### Skeleton/Loader

```tsx
import { Skeleton, Loader } from "@/components/ui";

<Skeleton variant="text" />
<Loader size="md" />
```

## Color Palette

This project uses the Catppuccin Macchiato color palette. The colors are available as Tailwind CSS classes:

- **Accent Colors**: `ctp-mauve`, `ctp-lavender`, `ctp-blue`, `ctp-sapphire`, `ctp-sky`, `ctp-teal`, `ctp-green`, `ctp-yellow`, `ctp-peach`, `ctp-maroon`, `ctp-red`, `ctp-pink`, `ctp-flamingo`, `ctp-rosewater`
- **Text Colors**: `ctp-text`, `ctp-subtext1`, `ctp-subtext0`
- **Surface Colors**: `ctp-surface0`, `ctp-surface1`, `ctp-surface2`
- **Base Colors**: `ctp-base`, `ctp-mantle`, `ctp-crust`
- **Overlay Colors**: `ctp-overlay0`, `ctp-overlay1`, `ctp-overlay2`

Semantic aliases are also available:

- `background`, `background-mantle`, `background-crust`
- `foreground`, `foreground-muted`
- `border`, `accent`, `accent-hover`

## Development Tools

### ESLint

ESLint is configured with Next.js and Prettier rules. Run linting with:

```bash
pnpm lint
```

### Prettier

Code formatting is handled by Prettier. Format your code with:

```bash
pnpm format
```

### Git Hooks

Husky and lint-staged are configured to run linting and formatting on staged files before commits.

## Environment Variables

See `.env.example` for required environment variables. Copy it to `.env.local` and update the values:

```bash
cp .env.example .env.local
```

## Supabase Setup

This project uses Supabase for authentication, database, and storage. You can run Supabase locally for development or connect to a remote Supabase project.

### Prerequisites

The required Supabase packages are already installed:

- `@supabase/supabase-js` - Core Supabase JavaScript client
- `@supabase/ssr` - Server-side rendering helpers for Next.js
- `zod` - Runtime environment variable validation

### Configuring Environment Variables

**Important:** The application validates environment variables at runtime. Missing or invalid Supabase configuration will cause the app to throw an error with a helpful message.

1. Copy the example environment file:

```bash
cp .env.example .env.local
```

2. Update `.env.local` with your Supabase credentials:

```env
# For local development
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# For production
# NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

**Getting your Supabase credentials:**

- **Local Development**: Run `pnpm supabase:start` and copy the API URL and anon key from the output
- **Production**: Go to your Supabase project settings → API → Copy the URL and anon key

### Local Development

1. **Install Docker** (required for local Supabase):
   - [Docker Desktop](https://www.docker.com/products/docker-desktop) for Mac/Windows
   - [Docker Engine](https://docs.docker.com/engine/install/) for Linux

2. **Start Supabase locally**:

   ```bash
   pnpm supabase:start
   ```

   This will:
   - Start all Supabase services in Docker containers
   - Apply all migrations from `supabase/migrations/`
   - Output the API URL and keys (update your `.env.local` with these values)

3. **Access Supabase Studio**:
   - Open http://localhost:54323 in your browser
   - Use Supabase Studio to view your database, run queries, and manage data

4. **Stop Supabase**:
   ```bash
   pnpm supabase:stop
   ```

### Connecting to a Remote Supabase Project

1. **Create a Supabase project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project

2. **Link your local repository** to the remote project:

   ```bash
   npx supabase link --project-ref your-project-ref
   ```

   You can find your project ref in the Supabase dashboard URL:
   `https://app.supabase.com/project/[your-project-ref]`

3. **Push migrations to remote**:

   ```bash
   npx supabase db push
   ```

4. **Update environment variables**:
   - Copy the API URL and anon key from your Supabase project settings
   - Update `.env.local` with the production values

### Database Schema

The database includes three main tables:

#### `profiles`

- Linked to `auth.users` via UUID
- Stores user display name, avatar URL, and ShareX preferences
- RLS: Users can view all profiles, but only update their own

#### `images`

- Stores metadata for uploaded images
- Fields: id, owner_id, storage_key, filename, extension, size, dimensions, mime_type, checksum, visibility
- RLS: Public images viewable by all, private images only by owner
- Cascade delete: Deleting an image record also removes the file from storage

#### `api_tokens`

- Used for ShareX integration and API authentication
- Stores hashed tokens, not plaintext
- RLS: Full access limited to token owner

### Storage

Images are stored in the `images` bucket with:

- Public read access (visibility controlled by RLS and metadata)
- Authenticated write access
- 50MB file size limit
- Allowed MIME types: JPEG, PNG, GIF, WebP, SVG, BMP, TIFF

### Authentication & Client Setup

The application includes a complete authentication setup with:

#### Client Utilities

- **Browser Client** (`@/lib/supabase/client`) - For client components
- **Server Client** (`@/lib/supabase/server`) - For server components and actions
- **Helper Functions** (`getUser()`, `getSession()`) - Retrieve auth state on the server

#### React Hooks

The app provides React hooks for client-side authentication:

```tsx
import { useSession, useSupabase } from "@/lib/supabase/auth-context";

function MyComponent() {
  const { user, isLoading, isAuthenticated } = useSession();
  const supabase = useSupabase();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;

  return <div>Welcome, {user.email}!</div>;
}
```

**Available hooks:**

- `useSession()` - Returns `{ user, session, authState, isLoading, isAuthenticated, isUnauthenticated }`
- `useSupabase()` - Returns the authenticated Supabase client

#### Protected Routes

The middleware automatically protects these routes:

- `/profile` - User profile page
- `/upload` - File upload page

Unauthenticated users are redirected to `/auth/sign-in` with a `redirectTo` parameter for seamless return after login.

#### Environment Validation

The app validates Supabase environment variables at runtime using Zod. If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing or invalid, the app will throw a descriptive error during initialization.

See `/lib/supabase/README.md` for detailed documentation on using the Supabase clients.

### Available Supabase Scripts

- `pnpm supabase:start` - Start local Supabase instance
- `pnpm supabase:stop` - Stop local Supabase instance
- `pnpm supabase:status` - Check status of local Supabase services
- `pnpm supabase:reset` - Reset local database (reapply all migrations)
- `pnpm supabase:types` - Regenerate TypeScript types from database schema
- `pnpm supabase:migrate` - Push local migrations to remote project

### Creating New Migrations

1. **Generate a new migration file**:

   ```bash
   npx supabase migration new your_migration_name
   ```

2. **Edit the migration file** in `supabase/migrations/`

3. **Apply the migration locally**:

   ```bash
   pnpm supabase:reset
   ```

4. **Regenerate TypeScript types**:

   ```bash
   pnpm supabase:types
   ```

5. **Push to remote** (when ready):
   ```bash
   pnpm supabase:migrate
   ```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Catppuccin Theme](https://github.com/catppuccin/catppuccin)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

## License

MIT
