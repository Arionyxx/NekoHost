import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { ToastProvider } from "@/components/ui";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Image Gallery",
    template: "%s | Image Gallery",
  },
  description:
    "A modern image hosting and sharing platform with public galleries, private uploads, and seamless ShareX integration.",
  keywords: ["image hosting", "image gallery", "photo sharing", "upload images"],
  authors: [{ name: "Image Gallery" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Image Gallery",
    title: "Image Gallery - Upload and Share Images",
    description:
      "A modern image hosting and sharing platform with public galleries, private uploads, and seamless ShareX integration.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Image Gallery",
    description:
      "A modern image hosting and sharing platform with public galleries, private uploads, and seamless ShareX integration.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <AuthProvider>
          <ToastProvider>
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <main className="flex-1 bg-background-crust">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  {children}
                </div>
              </main>
              <footer className="bg-background-mantle border-t border-border py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-foreground-muted text-sm">
                  <p>Built with Next.js 14, TypeScript, and Tailwind CSS</p>
                </div>
              </footer>
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
