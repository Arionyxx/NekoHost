"use client";

import { useEffect, useState } from "react";
import { Button, Input, Card, Badge, useToast } from "@/components/ui";
import { useSession, useSupabase } from "@/lib/supabase/auth-context";

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  sharex_default_visibility: "public" | "private";
}

interface ApiToken {
  id: string;
  token_hash: string;
  description: string | null;
  created_at: string;
}

export default function SettingsPage() {
  const { user } = useSession();
  const supabase = useSupabase();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    display_name: "",
    avatar_url: "",
    sharex_default_visibility: "private",
  });
  const [apiTokens, setApiTokens] = useState<ApiToken[]>([]);
  const [newTokenDescription, setNewTokenDescription] = useState("");
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [newlyGeneratedToken, setNewlyGeneratedToken] = useState<{
    token: string;
    id: string;
  } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      if (!user) return;

      try {
        const [profileRes, tokensRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase.from("api_tokens").select("*").eq("owner_id", user.id),
        ]);

        if (profileRes.data) {
          setProfile(profileRes.data);
        }

        if (tokensRes.data) {
          setApiTokens(tokensRes.data);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        showToast("Error loading settings", "error");
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [user, supabase, showToast]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          sharex_default_visibility: profile.sharex_default_visibility,
        })
        .eq("id", user.id);

      if (error) {
        showToast(error.message, "error");
        return;
      }

      showToast("Profile updated successfully!", "success");
    } catch {
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const generateToken = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  };

  const hashToken = async (token: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleGenerateToken = async () => {
    if (!user) return;

    setIsGeneratingToken(true);

    try {
      const token = generateToken();
      const tokenHash = await hashToken(token);

      const { data, error } = await supabase
        .from("api_tokens")
        .insert({
          owner_id: user.id,
          token_hash: tokenHash,
          description: newTokenDescription || null,
        })
        .select()
        .single();

      if (error) {
        showToast(error.message, "error");
        return;
      }

      setApiTokens([...apiTokens, data]);
      setNewlyGeneratedToken({ token, id: data.id });
      setNewTokenDescription("");
      showToast("API token generated successfully!", "success");
    } catch {
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleDeleteToken = async (tokenId: string) => {
    if (!confirm("Are you sure you want to delete this token?")) return;

    try {
      const { error } = await supabase
        .from("api_tokens")
        .delete()
        .eq("id", tokenId);

      if (error) {
        showToast(error.message, "error");
        return;
      }

      setApiTokens(apiTokens.filter((t) => t.id !== tokenId));
      if (newlyGeneratedToken?.id === tokenId) {
        setNewlyGeneratedToken(null);
      }
      showToast("Token deleted successfully", "success");
    } catch {
      showToast("An unexpected error occurred", "error");
    }
  };

  const getShareXConfig = (token: string) => {
    const baseUrl = window.location.origin;
    return {
      Version: "14.1.0",
      Name: "Custom Image Uploader",
      DestinationType: "ImageUploader",
      RequestMethod: "POST",
      RequestURL: `${baseUrl}/api/upload`,
      Headers: {
        Authorization: `Bearer ${token}`,
      },
      Body: "MultipartFormData",
      FileFormName: "file",
      URL: "$json:url$",
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!", "success");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-accent">Settings</h1>
        <Card>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-ctp-surface0 rounded w-3/4"></div>
            <div className="h-4 bg-ctp-surface0 rounded w-1/2"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-accent">Settings</h1>

      <Card>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Profile Settings
        </h2>
        <div className="space-y-4">
          <Input
            label="Display Name"
            type="text"
            value={profile.display_name || ""}
            onChange={(e) =>
              setProfile({ ...profile, display_name: e.target.value })
            }
            placeholder="Your display name"
          />

          <Input
            label="Avatar URL"
            type="url"
            value={profile.avatar_url || ""}
            onChange={(e) =>
              setProfile({ ...profile, avatar_url: e.target.value })
            }
            placeholder="https://example.com/avatar.jpg"
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Default Image Visibility
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={profile.sharex_default_visibility === "private"}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      sharex_default_visibility: e.target.value as
                        | "public"
                        | "private",
                    })
                  }
                  className="mr-2"
                />
                <span className="text-foreground">Private</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={profile.sharex_default_visibility === "public"}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      sharex_default_visibility: e.target.value as
                        | "public"
                        | "private",
                    })
                  }
                  className="mr-2"
                />
                <span className="text-foreground">Public</span>
              </label>
            </div>
          </div>

          <Button
            onClick={handleSaveProfile}
            variant="primary"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          API Tokens
        </h2>
        <p className="text-foreground-muted text-sm mb-4">
          Generate API tokens to use with ShareX or other applications. Keep
          your tokens secure and never share them publicly.
        </p>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              value={newTokenDescription}
              onChange={(e) => setNewTokenDescription(e.target.value)}
              placeholder="Token description (optional)"
              className="flex-1"
            />
            <Button
              onClick={handleGenerateToken}
              variant="primary"
              disabled={isGeneratingToken}
            >
              {isGeneratingToken ? "Generating..." : "Generate Token"}
            </Button>
          </div>

          {newlyGeneratedToken && (
            <div className="p-4 bg-ctp-green/10 border border-ctp-green rounded-md space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">
                  ⚠️ Save this token now - you won&apos;t be able to see it
                  again!
                </p>
                <div className="flex gap-2">
                  <code className="flex-1 p-2 bg-ctp-surface0 rounded text-foreground text-sm break-all">
                    {newlyGeneratedToken.token}
                  </code>
                  <Button
                    onClick={() => copyToClipboard(newlyGeneratedToken.token)}
                    variant="secondary"
                    size="sm"
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-2">
                  ShareX Configuration
                </p>
                <div className="flex gap-2">
                  <pre className="flex-1 p-2 bg-ctp-surface0 rounded text-foreground text-xs overflow-x-auto">
                    {JSON.stringify(
                      getShareXConfig(newlyGeneratedToken.token),
                      null,
                      2
                    )}
                  </pre>
                  <Button
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify(
                          getShareXConfig(newlyGeneratedToken.token),
                          null,
                          2
                        )
                      )
                    }
                    variant="secondary"
                    size="sm"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {apiTokens.length === 0 ? (
              <p className="text-foreground-muted text-sm">
                No API tokens generated yet.
              </p>
            ) : (
              apiTokens.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center justify-between p-3 bg-ctp-surface0 rounded-md"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">
                        {token.description || "Unnamed Token"}
                      </span>
                      <Badge variant="info">Active</Badge>
                    </div>
                    <p className="text-xs text-foreground-muted mt-1">
                      Hash: ...{token.token_hash.slice(-8)} • Created:{" "}
                      {new Date(token.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDeleteToken(token.id)}
                    variant="outline"
                    size="sm"
                    className="text-ctp-red border-ctp-red hover:bg-ctp-red/10"
                  >
                    Delete
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
