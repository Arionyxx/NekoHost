# Next.js 14 App with Catppuccin Macchiato Theme

A modern Next.js 14 application with TypeScript, Tailwind CSS, and the beautiful Catppuccin Macchiato color palette.

## Features

- ⚡️ **Next.js 14** with App Router
- 🎨 **TypeScript** for type safety
- 💅 **Tailwind CSS** for styling
- 🌈 **Catppuccin Macchiato** color palette
- 🔐 **Supabase Authentication** - Full auth integration with React hooks
- 🎯 **UI Components** - Button, Card, Input, Badge, Skeleton/Loader, Toast, Loading Overlay
- 🔧 **Developer Tools** - ESLint, Prettier, Husky, lint-staged
- 📱 **Responsive Design** - Mobile, tablet, and desktop optimized layouts
- ♿️ **Accessibility** - WCAG 2.1 AA compliant with keyboard navigation and focus states
- 🎭 **Smooth Animations** - Subtle transitions and animations consistent with theme
- 🛡️ **Protected Routes** - Middleware-based route protection
- ✅ **Environment Validation** - Runtime validation with Zod
- 🧪 **Visual Regression Tests** - Automated screenshot testing with Playwright
- 🎨 **Optimized Typography** - Enhanced readability with proper spacing and scales

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

## ShareX Integration

This application includes a dedicated API endpoint for ShareX integration, allowing you to upload images directly from ShareX to your personal gallery.

### Setting Up ShareX

1. **Generate an API Token**:
   - Navigate to the Settings page in the application
   - Scroll to the "API Tokens" section
   - Enter an optional description for your token (e.g., "My Desktop PC")
   - Click "Generate Token"
   - **Important**: Save the generated token immediately - you won't be able to see it again!

2. **Download ShareX Configuration**:
   - After generating a token, you'll see a ShareX Configuration section
   - Click the "Download" button to download a `.sxcu` file
   - Alternatively, copy the JSON configuration manually

3. **Import Configuration into ShareX**:
   - If you downloaded the `.sxcu` file, simply double-click it to import
   - ShareX will automatically configure the custom uploader
   - Alternatively, in ShareX:
     - Go to **Destinations** → **Destination settings** → **Custom uploaders**
     - Click **Import** → **From file** and select the `.sxcu` file
     - Or click **New** and paste the JSON configuration manually

4. **Set as Active Uploader**:
   - In ShareX, go to **Destinations** → **Image uploader**
   - Select your custom uploader from the list

5. **Start Uploading**:
   - Take a screenshot or select an image
   - ShareX will automatically upload it to your gallery
   - The image URL will be copied to your clipboard

### ShareX Configuration Example

```json
{
  "Version": "14.1.0",
  "Name": "Custom Image Uploader",
  "DestinationType": "ImageUploader",
  "RequestMethod": "POST",
  "RequestURL": "https://your-domain.com/api/sharex/upload",
  "Headers": {
    "Authorization": "Bearer your-token-here"
  },
  "Body": "MultipartFormData",
  "FileFormName": "file",
  "URL": "$json:url$"
}
```

### API Endpoint Details

**Endpoint**: `POST /api/sharex/upload`

**Authentication**: Bearer token in Authorization header

**Request**:

- Content-Type: `multipart/form-data`
- Field name: `file`
- Max file size: 50MB
- Allowed formats: JPEG, PNG, GIF, WebP, SVG, BMP, TIFF

**Response** (Success):

```json
{
  "success": true,
  "url": "https://your-domain.com/storage/path/to/image.png",
  "filename": "image.png"
}
```

**Response** (Error):

```json
{
  "error": "Error message description"
}
```

**Rate Limiting**:

- 100 uploads per hour per token
- Rate limit headers included in response:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: Timestamp when the rate limit resets

### Managing API Tokens

- **View Tokens**: See all your active tokens in the Settings page
- **Last Used**: Check when each token was last used
- **Revoke Tokens**: Delete tokens you no longer need
- **Multiple Tokens**: Create separate tokens for different devices or applications

### Security Best Practices

- **Keep tokens secure**: Treat API tokens like passwords
- **Use descriptive names**: Name tokens by device/location for easy management
- **Revoke unused tokens**: Delete tokens you no longer use
- **Monitor usage**: Check "Last used" timestamps to detect unauthorized usage
- **Environment-specific tokens**: Use different tokens for different environments

### Troubleshooting

**"Invalid or expired token" error**:

- Verify the token is correct and hasn't been deleted
- Check that the Authorization header format is `Bearer <token>`

**"Rate limit exceeded" error**:

- Wait for the rate limit window to reset (shown in error message)
- Consider generating multiple tokens if you need higher limits

**"Invalid file type" error**:

- Ensure you're uploading an image file
- Check that the file format is supported (JPEG, PNG, GIF, WebP, SVG, BMP, TIFF)

**"File size exceeds limit" error**:

- Compress or resize images to under 50MB
- Consider using image optimization tools before uploading

## Deployment

### Production Deployment Considerations

#### Environment Variables

Ensure all required environment variables are configured in your production environment:

```env
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

#### Build Optimization

The application is optimized for production with:

- **Static Asset Optimization**: Images and fonts are optimized automatically
- **Code Splitting**: Automatic code splitting via Next.js App Router
- **CSS Optimization**: Tailwind CSS purges unused styles in production
- **Performance**: Lighthouse scores optimized for accessibility, performance, and SEO

#### Vercel Deployment (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Configure environment variables
4. Deploy

```bash
pnpm build
pnpm start
```

#### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

#### Performance Monitoring

- Monitor Core Web Vitals in production
- Use Vercel Analytics or similar tools
- Track Lighthouse scores regularly
- Monitor Supabase usage and database performance

#### CDN Configuration

For optimal performance:

- Enable CDN caching for static assets
- Configure appropriate cache headers
- Use image optimization services
- Consider implementing a reverse proxy (Cloudflare, etc.)

### Accessibility Features

This application is built with accessibility in mind:

- **WCAG 2.1 AA Compliant**: Color contrast ratios meet accessibility standards
- **Keyboard Navigation**: Full keyboard accessibility with visible focus states
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Indicators**: High-contrast mauve/lavender focus rings for visibility
- **Responsive Design**: Mobile-first approach with tablet and desktop breakpoints
- **Visual Regression Tests**: Automated screenshot testing to prevent styling regressions

### Testing

#### Visual Regression Tests

Run visual regression tests to ensure UI consistency:

```bash
pnpm test
```

The test suite includes:

- Desktop, tablet, and mobile viewport tests
- Component state verification (focus, hover, etc.)
- Theme consistency checks
- Accessibility validation

#### Accessibility Tests

Automated accessibility tests verify:

- Keyboard navigation
- Focus state contrast
- ARIA labels and roles
- Image alt text
- Form label associations
- Color contrast ratios

### Theme Attribution

This application uses the [Catppuccin](https://github.com/catppuccin/catppuccin) color palette, specifically the **Macchiato** variant.

**Catppuccin** is a community-driven pastel theme that aims to be the middle ground between low and high contrast themes. It consists of 4 beautiful pastel color palettes.

- **Theme**: Catppuccin Macchiato
- **License**: MIT
- **Repository**: [github.com/catppuccin/catppuccin](https://github.com/catppuccin/catppuccin)
- **Website**: [catppuccin.com](https://catppuccin.com)

The color palette provides:

- Excellent readability and accessibility
- Soothing pastel colors that reduce eye strain
- Consistent theming across all components
- Beautiful gradients and hover states

Special thanks to the Catppuccin team for creating and maintaining this beautiful theme! 🎨

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Catppuccin Theme](https://github.com/catppuccin/catppuccin)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Playwright Testing](https://playwright.dev)

## License

MIT
