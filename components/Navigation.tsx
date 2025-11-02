"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession, useSupabase } from "@/lib/supabase/auth-context";
import { Button, useToast } from "@/components/ui";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useSession();
  const supabase = useSupabase();
  const { showToast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isProfileOpen]);

  const links: Array<{
    href: string;
    label: string;
    authRequired?: boolean;
  }> = [
    { href: "/", label: "Home" },
    { href: "/upload", label: "Upload", authRequired: true },
  ];

  const isActive = (href: string) => pathname === href;

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      showToast("Signed out successfully", "success");
      router.push("/");
    } catch {
      showToast("Error signing out", "error");
    }
  };

  return (
    <nav className="bg-background-mantle border-b border-border shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-accent hover:text-accent-hover transition-colors"
            >
              Next.js App
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {links
              .filter((link) => !link.authRequired || isAuthenticated)
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-ctp-surface0 text-accent"
                      : "text-foreground hover:bg-ctp-surface0 hover:text-accent-hover"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-ctp-surface0 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-background font-bold">
                        {user?.email?.[0].toUpperCase()}
                      </div>
                    </button>

                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-background-mantle border border-border rounded-md shadow-lg py-1 z-50">
                        <div className="px-4 py-2 border-b border-border">
                          <p className="text-sm font-medium text-foreground truncate">
                            {user?.email}
                          </p>
                        </div>
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-4 py-2 text-sm text-foreground hover:bg-ctp-surface0 transition-colors"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-4 py-2 text-sm text-foreground hover:bg-ctp-surface0 transition-colors"
                        >
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            handleSignOut();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-ctp-red hover:bg-ctp-surface0 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/auth/sign-in">
                      <Button variant="outline" size="sm">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/sign-up">
                      <Button variant="primary" size="sm">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground hover:text-accent p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {links
              .filter((link) => !link.authRequired || isAuthenticated)
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-ctp-surface0 text-accent"
                      : "text-foreground hover:bg-ctp-surface0 hover:text-accent-hover"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

            {!isLoading && (
              <div className="pt-4 border-t border-border mt-4">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 mb-2">
                      <p className="text-sm font-medium text-foreground">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-ctp-surface0 transition-colors"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-ctp-surface0 transition-colors"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleSignOut();
                      }}
                      className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-ctp-red hover:bg-ctp-surface0 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="px-3 space-y-2">
                    <Link
                      href="/auth/sign-in"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      href="/auth/sign-up"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button variant="primary" className="w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
