"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/supabase/auth-context";
import { Badge, Button, Dialog, Tooltip, useToast } from "@/components/ui";

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
  imageUrl: string;
  profiles: {
    display_name: string | null;
    id: string;
  };
}

interface ImageDetailViewerProps {
  image: ImageData;
}

export default function ImageDetailViewer({ image }: ImageDetailViewerProps) {
  const { user } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const [currentVisibility, setCurrentVisibility] = useState(image.visibility);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isVisibilityDialogOpen, setIsVisibilityDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);

  const isOwner = user?.id === image.owner_id;

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

  const getUsernameFromEmail = (displayName: string | null, userId: string) => {
    if (displayName) {
      return displayName.toLowerCase().replace(/\s+/g, "-");
    }
    return userId.slice(0, 8);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = image.imageUrl;
    link.download = image.filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Download started", "success");
  };

  const handleCopyDirectLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Direct link copied to clipboard!", "success");
    } catch (err) {
      console.error("Failed to copy:", err);
      showToast("Failed to copy link", "error");
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      const markdown = `![${image.filename}](${image.imageUrl})`;
      await navigator.clipboard.writeText(markdown);
      showToast("Markdown copied to clipboard!", "success");
    } catch (err) {
      console.error("Failed to copy:", err);
      showToast("Failed to copy markdown", "error");
    }
  };

  const handleCopyHTML = async () => {
    try {
      const html = `<img src="${image.imageUrl}" alt="${image.filename}" />`;
      await navigator.clipboard.writeText(html);
      showToast("HTML embed copied to clipboard!", "success");
    } catch (err) {
      console.error("Failed to copy:", err);
      showToast("Failed to copy HTML", "error");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/images/${image.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete image");
      }

      showToast("Image deleted successfully", "success");
      router.push("/gallery");
    } catch (err) {
      console.error("Delete error:", err);
      showToast(
        err instanceof Error ? err.message : "Failed to delete image",
        "error"
      );
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleToggleVisibility = async () => {
    setIsUpdatingVisibility(true);
    const newVisibility = currentVisibility === "public" ? "private" : "public";

    try {
      const response = await fetch(`/api/images/${image.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ visibility: newVisibility }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update visibility");
      }

      setCurrentVisibility(newVisibility);
      showToast(`Image is now ${newVisibility}`, "success");
    } catch (err) {
      console.error("Update error:", err);
      showToast(
        err instanceof Error ? err.message : "Failed to update visibility",
        "error"
      );
    } finally {
      setIsUpdatingVisibility(false);
      setIsVisibilityDialogOpen(false);
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto">
        {/* Header with badges and back button */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge
              variant={currentVisibility === "public" ? "success" : "warning"}
            >
              {currentVisibility}
            </Badge>
            {isOwner && (
              <Badge variant="accent" className="bg-ctp-mauve text-ctp-base">
                Your Image
              </Badge>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            ← Back
          </Button>
        </div>

        {/* Image viewer with dark backdrop */}
        <div className="mb-6 bg-ctp-crust rounded-lg overflow-hidden border border-border shadow-lg">
          <div className="flex items-center justify-center min-h-[400px] p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.imageUrl}
              alt={image.filename}
              className="max-w-full h-auto max-h-[70vh] rounded-lg object-contain"
            />
          </div>
        </div>

        {/* Metadata card with mauve/lavender accents */}
        <div className="bg-ctp-base rounded-lg border border-ctp-mauve/30 shadow-lg p-6 mb-6">
          {/* Title and uploader */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {image.filename}
            </h1>
            <div className="flex items-center gap-2 text-foreground-muted">
              <span>Uploaded by</span>
              <Link
                href={`/u/${getUsernameFromEmail(image.profiles?.display_name, image.owner_id)}`}
                className="text-ctp-mauve hover:text-ctp-lavender transition-colors font-medium"
              >
                {image.profiles?.display_name || "Unknown User"}
              </Link>
              <span>•</span>
              <span>{formatDate(image.created_at)}</span>
            </div>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-ctp-surface0 rounded-lg border border-ctp-mauve/20 mb-6">
            <div>
              <p className="text-sm text-ctp-lavender mb-1 font-medium">
                File Size
              </p>
              <p className="text-foreground font-medium">
                {formatFileSize(image.size_bytes)}
              </p>
            </div>
            {image.width && image.height && (
              <div>
                <p className="text-sm text-ctp-lavender mb-1 font-medium">
                  Dimensions
                </p>
                <p className="text-foreground font-medium">
                  {image.width} × {image.height}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-ctp-lavender mb-1 font-medium">
                Format
              </p>
              <p className="text-foreground font-medium">
                {image.mime_type.split("/")[1].toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-sm text-ctp-lavender mb-1 font-medium">
                Visibility
              </p>
              <p className="text-foreground font-medium">
                {currentVisibility}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-4">
            {/* Share buttons */}
            <div>
              <h3 className="text-sm font-medium text-ctp-lavender mb-3">
                Share
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Tooltip content="Download image">
                  <Button
                    variant="primary"
                    onClick={handleDownload}
                    className="w-full bg-ctp-mauve hover:bg-ctp-lavender text-ctp-base"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </Button>
                </Tooltip>
                <Tooltip content="Copy direct link">
                  <Button
                    variant="outline"
                    onClick={handleCopyDirectLink}
                    className="w-full border-ctp-mauve/50 hover:border-ctp-mauve hover:bg-ctp-mauve/10"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Link
                  </Button>
                </Tooltip>
                <Tooltip content="Copy markdown embed code">
                  <Button
                    variant="outline"
                    onClick={handleCopyMarkdown}
                    className="w-full border-ctp-mauve/50 hover:border-ctp-mauve hover:bg-ctp-mauve/10"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Markdown
                  </Button>
                </Tooltip>
                <Tooltip content="Copy HTML embed code">
                  <Button
                    variant="outline"
                    onClick={handleCopyHTML}
                    className="w-full border-ctp-mauve/50 hover:border-ctp-mauve hover:bg-ctp-mauve/10"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    HTML
                  </Button>
                </Tooltip>
              </div>
            </div>

            {/* Owner actions */}
            {isOwner && (
              <div>
                <h3 className="text-sm font-medium text-ctp-lavender mb-3">
                  Manage
                </h3>
                <div className="flex gap-2">
                  <Tooltip
                    content={`Make image ${currentVisibility === "public" ? "private" : "public"}`}
                  >
                    <Button
                      variant="outline"
                      onClick={() => setIsVisibilityDialogOpen(true)}
                      className="flex-1 border-ctp-yellow/50 hover:border-ctp-yellow hover:bg-ctp-yellow/10"
                      disabled={isUpdatingVisibility}
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {currentVisibility === "public" ? (
                          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        ) : (
                          <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        )}
                      </svg>
                      Toggle Visibility
                    </Button>
                  </Tooltip>
                  <Tooltip content="Delete image permanently">
                    <Button
                      variant="outline"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="flex-1 border-ctp-red/50 hover:border-ctp-red hover:bg-ctp-red/10 text-ctp-red"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </Button>
                  </Tooltip>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Image"
        description="Are you sure you want to delete this image? This action cannot be undone and the image will be permanently removed from storage."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Visibility toggle confirmation dialog */}
      <Dialog
        isOpen={isVisibilityDialogOpen}
        onClose={() => setIsVisibilityDialogOpen(false)}
        onConfirm={handleToggleVisibility}
        title={`Make Image ${currentVisibility === "public" ? "Private" : "Public"}?`}
        description={
          currentVisibility === "public"
            ? "Making this image private will hide it from public gallery and only you will be able to view it."
            : "Making this image public will make it visible to everyone in the gallery."
        }
        confirmText="Change Visibility"
        cancelText="Cancel"
        variant="warning"
        isLoading={isUpdatingVisibility}
      />
    </>
  );
}
