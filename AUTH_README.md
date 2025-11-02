# Authentication and Settings Documentation

This document describes the authentication and settings features implemented in the application.

## Features

### Authentication Pages

#### Sign In (`/auth/sign-in`)

- Email/password authentication with Supabase
- Form validation with error messages
- Password reset link
- Redirect to original page after login via `redirectTo` query param
- Links to sign-up page

#### Sign Up (`/auth/sign-up`)

- User registration with email, password, and display name
- Password confirmation validation
- Automatic profile creation via database trigger
- Form validation with error messages
- Links to sign-in page

#### Password Reset (`/auth/reset`)

- Send password reset email via Supabase
- Email validation
- Success confirmation screen
- Links back to sign-in

#### Update Password (`/auth/update-password`)

- Update password after reset flow
- Password confirmation validation
- Automatic redirect to home after success

### Navigation

The navigation component is now authentication-aware:

**When Logged Out:**

- "Sign In" and "Sign Up" buttons in desktop view
- Same buttons in mobile menu

**When Logged In:**

- User avatar (first letter of email) with dropdown menu
- Dropdown contains:
  - User email display
  - Profile link
  - Settings link
  - Sign Out button
- Mobile menu includes same options

### Protected Pages

#### Profile Page (`/profile`)

Shows user information and statistics:

- Account details (display name, email, avatar URL, default visibility)
- Member since date
- Total uploads count
- API tokens list with creation dates and last used dates
- Links to settings for editing

#### Settings Page (`/settings`)

Allows users to configure their account:

**Profile Settings:**

- Edit display name
- Edit avatar URL
- Set default image visibility (public/private)
- Save changes button with optimistic UI

**API Token Management:**

- Generate new API tokens with optional description
- View existing tokens (shows last 8 characters of hash)
- Delete tokens with confirmation
- See token creation dates

**ShareX Integration:**

- After generating a token, displays:
  - Full token value (shown only once!)
  - ShareX JSON configuration snippet
  - Copy buttons for both
- JSON config includes:
  - API endpoint URL
  - Authorization header with Bearer token
  - Proper multipart form data setup

### Security Features

1. **API Token Generation:**
   - Uses `crypto.getRandomValues()` for secure random token generation
   - 32-byte tokens (64 hex characters)
   - Tokens are hashed with SHA-256 before storage
   - Only full token shown once immediately after creation
   - Stored tokens only show last 8 characters of hash

2. **Protected Routes:**
   - `/profile`, `/settings`, and `/upload` require authentication
   - Middleware redirects to sign-in with return URL
   - Automatic session refresh

3. **Form Validation:**
   - Email format validation
   - Password minimum length (6 characters)
   - Password confirmation matching
   - Display name minimum length (2 characters)

### Toast Notifications

All pages include toast notifications for:

- Success messages (green)
- Error messages (red)
- Info messages (blue)
- Warning messages (yellow)

Toasts auto-dismiss after 5 seconds and can be manually closed.

### UI/UX Features

1. **Loading States:**
   - Disabled forms during submission
   - Loading text on buttons ("Signing in...", "Saving...", etc.)
   - Skeleton loaders for data fetching

2. **Responsive Design:**
   - Mobile-friendly navigation with hamburger menu
   - Responsive layouts for all pages
   - Touch-friendly buttons and inputs

3. **Catppuccin Theme:**
   - Consistent color scheme across all pages
   - Accent colors for interactive elements
   - Surface colors for cards and inputs
   - Proper contrast for accessibility

## Testing

### Integration Tests

Located in `/tests` directory using Playwright:

**Auth Tests (`auth.spec.ts`):**

- Navigation between auth pages
- Form validation errors
- Sign in/sign up page rendering
- Password reset flow
- Links between pages

**Profile/Settings Tests (`profile.spec.ts`):**

- Protected route redirects
- Redirect URL preservation
- Page structure validation

**Running Tests:**

```bash
npm test                 # Run all tests headless
npm run test:ui          # Run tests with UI
npm run test:report      # View test report
```

## Database Schema

### Profiles Table

- `id` (UUID) - References auth.users
- `display_name` (text) - User's display name
- `avatar_url` (text) - URL to user's avatar image
- `sharex_default_visibility` (enum) - Default visibility for uploads
- `sharex_auto_copy_link` (boolean) - Auto-copy ShareX links
- `created_at`, `updated_at` (timestamptz)

### API Tokens Table

- `id` (UUID) - Primary key
- `owner_id` (UUID) - References auth.users
- `token_hash` (text) - SHA-256 hash of token
- `description` (text) - Optional token description
- `last_used_at` (timestamptz) - Last usage timestamp
- `created_at` (timestamptz) - Creation timestamp

## Usage Examples

### Using Auth Hooks

```tsx
import { useSession, useSupabase } from "@/lib/supabase/auth-context";

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useSession();
  const supabase = useSupabase();

  if (isLoading) return <Loader />;
  if (!isAuthenticated) return <div>Please sign in</div>;

  return <div>Welcome, {user.email}!</div>;
}
```

### Displaying Toasts

```tsx
import { useToast } from "@/components/ui";

function MyComponent() {
  const { showToast } = useToast();

  const handleAction = async () => {
    try {
      // ... some action
      showToast("Success!", "success");
    } catch (error) {
      showToast("Error occurred", "error");
    }
  };

  return <button onClick={handleAction}>Do Something</button>;
}
```

### Generating API Tokens

The token generation process:

1. Generate 32 random bytes using `crypto.getRandomValues()`
2. Convert to hex string (64 characters)
3. Hash with SHA-256 for storage
4. Display full token to user once
5. Save only hash in database
6. Generate ShareX config with full token

## Security Considerations

1. **Never log full tokens** - Only log token IDs or last few characters
2. **HTTPS required** - Always use HTTPS in production for token transmission
3. **Token rotation** - Users can regenerate tokens anytime
4. **One-time display** - Full tokens shown only once after generation
5. **Secure storage** - Only hashed tokens stored in database

## Future Enhancements

Potential improvements:

- Email verification flow
- OAuth providers (Google, GitHub, etc.)
- Two-factor authentication
- Token expiration and auto-rotation
- Token usage analytics
- Profile picture upload
- Account deletion
