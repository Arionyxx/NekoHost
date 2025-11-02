import Link from "next/link";
import { Button, Card, Badge } from "@/components/ui";

export default function Home() {
  return (
    <div className="space-y-12 animate-page-enter">
      {/* Hero Section */}
      <section className="text-center py-8 md:py-12 px-4">
        <Badge variant="accent" className="mb-4 animate-fade-in">
          Fast & Secure Image Hosting
        </Badge>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-ctp-mauve to-ctp-lavender bg-clip-text text-transparent animate-fade-in">
          Upload & Share Images Instantly
        </h1>
        <p className="text-lg md:text-xl text-foreground-muted mb-8 max-w-2xl mx-auto px-4">
          A modern image hosting platform with drag-and-drop uploads, ShareX
          integration, and beautiful Catppuccin-themed interface.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
          <Link href="/upload">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Images
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              ShareX Setup
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
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
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">
            Drag & Drop Upload
          </h3>
          <p className="text-foreground-muted">
            Upload multiple images at once with an intuitive drag-and-drop
            interface and real-time progress tracking.
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
                <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">
            ShareX Integration
          </h3>
          <p className="text-foreground-muted">
            Seamlessly integrate with ShareX for automated screenshot uploads
            with customizable API tokens.
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
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">
            Secure & Private
          </h3>
          <p className="text-foreground-muted">
            Your images are stored securely with Supabase Storage and protected
            by row-level security policies.
          </p>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="text-center py-8 md:py-12 px-4">
        <Card className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
            Ready to start uploading?
          </h2>
          <p className="text-foreground-muted mb-6">
            Upload your first image in seconds or set up ShareX for automated
            screenshot sharing. Get instant shareable links with markdown and
            HTML snippets.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Start Uploading
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Configure ShareX
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
