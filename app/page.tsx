import Link from "next/link";
import { Button, Card, Badge } from "@/components/ui";

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <Badge variant="accent" className="mb-4">
          Next.js 14 + TypeScript
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-ctp-mauve to-ctp-lavender bg-clip-text text-transparent">
          Welcome to Your App
        </h1>
        <p className="text-xl text-foreground-muted mb-8 max-w-2xl mx-auto">
          A modern Next.js application with TypeScript, Tailwind CSS, and the
          beautiful Catppuccin Macchiato color palette.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/upload">
            <Button variant="primary" size="lg">
              Get Started
            </Button>
          </Link>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hover>
          <div className="mb-4">
            <div className="w-12 h-12 bg-ctp-mauve/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-ctp-mauve"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">
            Lightning Fast
          </h3>
          <p className="text-foreground-muted">
            Built with Next.js 14 and optimized for performance with the App
            Router.
          </p>
        </Card>

        <Card hover>
          <div className="mb-4">
            <div className="w-12 h-12 bg-ctp-lavender/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-ctp-lavender"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">
            Beautiful Design
          </h3>
          <p className="text-foreground-muted">
            Styled with Tailwind CSS and the Catppuccin Macchiato color palette.
          </p>
        </Card>

        <Card hover>
          <div className="mb-4">
            <div className="w-12 h-12 bg-ctp-blue/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-ctp-blue"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">
            Type Safe
          </h3>
          <p className="text-foreground-muted">
            Full TypeScript support for better developer experience and fewer
            bugs.
          </p>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12">
        <Card className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            Ready to get started?
          </h2>
          <p className="text-foreground-muted mb-6">
            Explore the upload page to see more components in action.
          </p>
          <Link href="/upload">
            <Button variant="primary" size="lg">
              Go to Upload
            </Button>
          </Link>
        </Card>
      </section>
    </div>
  );
}
