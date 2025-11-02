"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input, Card, useToast } from "@/components/ui";
import { useSupabase } from "@/lib/supabase/auth-context";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useSupabase();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const redirectTo = searchParams.get("redirectTo") || "/";

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error("[Sign In] Auth error:", error);
        showToast(error.message, "error");
        return;
      }

      console.log("[Sign In] Success:", {
        user: data.user?.email,
        session: !!data.session,
      });

      showToast("Signed in successfully!", "success");

      // Small delay to ensure session is set in cookies
      await new Promise((resolve) => setTimeout(resolve, 100));

      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      console.error("[Sign In] Unexpected error:", error);
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-accent">Sign In</h1>
            <p className="mt-2 text-foreground-muted">
              Welcome back! Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              error={errors.email}
              disabled={isLoading}
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              error={errors.password}
              disabled={isLoading}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <Link
                href="/auth/reset"
                className="text-sm text-accent hover:text-accent-hover transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-foreground-muted">
              Don&apos;t have an account?{" "}
            </span>
            <Link
              href="/auth/sign-up"
              className="text-accent hover:text-accent-hover font-medium transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center">
          <Card className="w-full max-w-md">
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-accent">Sign In</h1>
              </div>
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-ctp-surface0 rounded"></div>
                <div className="h-10 bg-ctp-surface0 rounded"></div>
                <div className="h-10 bg-ctp-surface0 rounded"></div>
              </div>
            </div>
          </Card>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
