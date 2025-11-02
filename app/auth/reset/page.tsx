"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input, Card, useToast } from "@/components/ui";
import { useSupabase } from "@/lib/supabase/auth-context";

export default function ResetPasswordPage() {
  const supabase = useSupabase();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const validateForm = () => {
    if (!email) {
      setError("Email is required");
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email address");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/update-password`,
        }
      );

      if (resetError) {
        showToast(resetError.message, "error");
        return;
      }

      setEmailSent(true);
      showToast("Password reset email sent!", "success");
    } catch {
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 mx-auto bg-ctp-green/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-ctp-green"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-accent">Check your email</h1>
              <p className="mt-2 text-foreground-muted">
                We&apos;ve sent a password reset link to{" "}
                <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>

            <p className="text-sm text-foreground-muted">
              Click the link in the email to reset your password. The link will
              expire in 1 hour.
            </p>

            <div className="pt-4 space-y-3">
              <Button
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="w-full"
              >
                Send another email
              </Button>
              <Link
                href="/auth/sign-in"
                className="block text-sm text-accent hover:text-accent-hover transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-accent">Reset Password</h1>
            <p className="mt-2 text-foreground-muted">
              Enter your email to receive a password reset link
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              disabled={isLoading}
              autoComplete="email"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <Link
              href="/auth/sign-in"
              className="text-accent hover:text-accent-hover transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
