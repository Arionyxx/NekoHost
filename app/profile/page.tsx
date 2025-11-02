"use client";

import { useEffect, useState } from "react";
import { Card, Badge, Skeleton } from "@/components/ui";
import { useSession, useSupabase } from "@/lib/supabase/auth-context";

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  sharex_default_visibility: "public" | "private";
  created_at: string;
}

interface ApiToken {
  id: string;
  description: string | null;
  created_at: string;
  last_used_at: string | null;
}

export default function ProfilePage() {
  const { user } = useSession();
  const supabase = useSupabase();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [apiTokens, setApiTokens] = useState<ApiToken[]>([]);
  const [imageCount, setImageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      try {
        const [profileRes, tokensRes, imagesRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase.from("api_tokens").select("*").eq("owner_id", user.id),
          supabase
            .from("images")
            .select("id", { count: "exact", head: true })
            .eq("owner_id", user.id),
        ]);

        if (profileRes.data) {
          setProfile(profileRes.data);
        }

        if (tokensRes.data) {
          setApiTokens(tokensRes.data);
        }

        setImageCount(imagesRes.count || 0);
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [user, supabase]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" className="h-8 w-48" />
        <Card>
          <div className="space-y-4">
            <Skeleton variant="text" className="h-6 w-full" />
            <Skeleton variant="text" className="h-6 w-3/4" />
            <Skeleton variant="text" className="h-6 w-1/2" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-accent">Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Account Details
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground-muted">
                Display Name
              </label>
              <p className="text-foreground mt-1">
                {profile?.display_name || "Not set"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-muted">
                Email
              </label>
              <p className="text-foreground mt-1">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-muted">
                Avatar URL
              </label>
              <p className="text-foreground mt-1 break-all">
                {profile?.avatar_url || "Not set"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-muted">
                Default Visibility
              </label>
              <div className="mt-1">
                <Badge
                  variant={
                    profile?.sharex_default_visibility === "public"
                      ? "success"
                      : "warning"
                  }
                >
                  {profile?.sharex_default_visibility || "private"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-muted">
                Member Since
              </label>
              <p className="text-foreground mt-1">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Statistics
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">Total Uploads</span>
                <span className="text-2xl font-bold text-accent">
                  {imageCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">API Tokens</span>
                <span className="text-2xl font-bold text-accent">
                  {apiTokens.length}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              API Tokens
            </h2>
            {apiTokens.length === 0 ? (
              <p className="text-foreground-muted text-sm">
                No API tokens generated yet. Create one in settings to use with
                ShareX.
              </p>
            ) : (
              <div className="space-y-2">
                {apiTokens.map((token) => (
                  <div
                    key={token.id}
                    className="p-3 bg-ctp-surface0 rounded-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-foreground text-sm">
                        {token.description || "Unnamed Token"}
                      </span>
                      <Badge variant="info">Active</Badge>
                    </div>
                    <p className="text-xs text-foreground-muted mt-1">
                      Created:{" "}
                      {new Date(token.created_at).toLocaleDateString()}
                    </p>
                    {token.last_used_at && (
                      <p className="text-xs text-foreground-muted">
                        Last used:{" "}
                        {new Date(token.last_used_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
