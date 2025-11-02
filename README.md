# Next.js 14 App with Catppuccin Macchiato Theme

A modern Next.js 14 application with TypeScript, Tailwind CSS, and the beautiful Catppuccin Macchiato color palette.

## Features

- ⚡️ **Next.js 14** with App Router
- 🎨 **TypeScript** for type safety
- 💅 **Tailwind CSS** for styling
- 🌈 **Catppuccin Macchiato** color palette
- 🎯 **UI Components** - Button, Card, Input, Badge, Skeleton/Loader
- 🔧 **Developer Tools** - ESLint, Prettier, Husky, lint-staged
- 📱 **Responsive Design** with mobile-friendly navigation

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
│   ├── layout.tsx         # Root layout with navigation
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

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Catppuccin Theme](https://github.com/catppuccin/catppuccin)

## License

MIT
