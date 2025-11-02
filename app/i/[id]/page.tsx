"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSupabase, useSession } from "@/lib/supabase/auth-context";
import { Badge, Card, Skeleton, Button } from "@/components/ui";
import { useRouter } from "next/navigation";

interface ImageData {
  id: string;
  filename: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  created_at: string;
  storage_key: string;
  owner_id: string;
  visibility: "public" | "private";
  mime_type: string;
  profiles: {
    display_name: string | null;
    id: string;
  };
}

export default function ImageDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const supabase = useSupabase();
  const { user } = useSession();
  const router = useRouter();
  const [image, setImage] = useState<ImageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const { data, error } = await supabase
          .from("images")
          .select(
            `
            id,
            filename,
            size_bytes,
            width,
            height,
            created_at,
            storage_key,
            owner_id,
            visibility,
            mime_type,
            profiles!images_owner_id_fkey (
              display_name,
              id
            )
          `
          )
          .eq("id", id)
          .single();

        if (error || !data) {
          setNotFound(true);
          return;
        }

        const imageData = data as unknown as ImageData;

        if (
          imageData.visibility === "private" &&
          imageData.owner_id !== user?.id
        ) {
          setNotFound(true);
          return;
        }

        setImage(imageData);
      } catch (error) {
        console.error("Error fetching image:", error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [supabase, id, user]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getImageUrl = (storageKey: string) => {
    const { data } = supabase.storage.from("images").getPublicUrl(storageKey);
    return data.publicUrl;
  };

  const getUsernameFromEmail = (displayName: string | null, userId: string) => {
    if (displayName) {
      return displayName.toLowerCase().replace(/\s+/g, "-");
    }
    return userId.slice(0, 8);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card>
          <Skeleton height="500px" className="w-full mb-4" />
          <div className="space-y-2">
            <Skeleton variant="text" className="w-3/4" />
            <Skeleton variant="text" className="w-1/2" />
            <Skeleton variant="text" className="w-2/3" />
          </div>
        </Card>
      </div>
    );
  }

  if (notFound || !image) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-ctp-surface0 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-ctp-overlay0"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Image not found
          </h2>
          <p className="text-foreground-muted mb-6">
            The image you&apos;re looking for doesn&apos;t exist or is private
          </p>
          <Button variant="primary" onClick={() => router.push("/gallery")}>
            Back to Gallery
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === image.owner_id;

  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge
                variant={image.visibility === "public" ? "success" : "warning"}
              >
                {image.visibility}
              </Badge>
              {isOwner && <Badge variant="accent">Your Image</Badge>}
            </div>
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              Back
            </Button>
          </div>

          <div className="bg-ctp-surface0 rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getImageUrl(image.storage_key)}
              alt={image.filename}
              className="w-full h-auto"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {image.filename}
            </h1>
            <div className="flex items-center gap-2 text-foreground-muted">
              <span>Uploaded by</span>
              <Link
                href={`/u/${getUsernameFromEmail(image.profiles?.display_name, image.owner_id)}`}
                className="text-accent hover:text-accent-hover transition-colors font-medium"
              >
                {image.profiles?.display_name || "Unknown User"}
              </Link>
              <span>•</span>
              <span>{formatDate(image.created_at)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-ctp-surface0 rounded-lg">
            <div>
              <p className="text-sm text-foreground-muted mb-1">File Size</p>
              <p className="text-foreground font-medium">
                {formatFileSize(image.size_bytes)}
              </p>
            </div>
            {image.width && image.height && (
              <div>
                <p className="text-sm text-foreground-muted mb-1">Dimensions</p>
                <p className="text-foreground font-medium">
                  {image.width} × {image.height}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-foreground-muted mb-1">Format</p>
              <p className="text-foreground font-medium">
                {image.mime_type.split("/")[1].toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-sm text-foreground-muted mb-1">Image ID</p>
              <p className="text-foreground font-medium text-xs">
                {image.id.slice(0, 8)}...
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={() =>
                window.open(getImageUrl(image.storage_key), "_blank")
              }
              className="flex-1"
            >
              View Full Size
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
              className="flex-1"
            >
              Copy Link
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
