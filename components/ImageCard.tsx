"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui";

interface ImageCardProps {
  id: string;
  filename: string;
  uploaderName: string;
  uploaderUsername: string;
  fileSize: number;
  uploadDate: string;
  imageUrl: string;
  width?: number;
  height?: number;
  visibility?: "public" | "private";
  showVisibilityBadge?: boolean;
}

export default function ImageCard({
  id,
  filename,
  uploaderName,
  uploaderUsername,
  fileSize,
  uploadDate,
  imageUrl,
  width,
  height,
  visibility,
  showVisibilityBadge = false,
}: ImageCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const aspectRatio = width && height ? width / height : 1;

  return (
    <div
      className="group relative bg-background-mantle rounded-lg overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300 border border-border"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/i/${id}`} className="block relative">
        <div
          className="relative overflow-hidden bg-ctp-surface0"
          style={{
            aspectRatio:
              aspectRatio > 2
                ? "2/1"
                : aspectRatio < 0.5
                  ? "1/2"
                  : aspectRatio.toString(),
          }}
        >
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-ctp-surface1" />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={filename}
            className={`w-full h-full object-cover transition-all duration-300 ${
              isHovered ? "scale-110" : "scale-100"
            } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImageLoaded(true)}
          />
          {showVisibilityBadge && visibility && (
            <div className="absolute top-2 right-2 z-10">
              <Badge
                variant={visibility === "public" ? "success" : "warning"}
                className="backdrop-blur-sm bg-opacity-90"
              >
                {visibility}
              </Badge>
            </div>
          )}
        </div>

        <div
          className={`absolute inset-0 bg-gradient-to-t from-ctp-crust via-ctp-crust/80 to-transparent transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="font-semibold text-ctp-text mb-2 truncate">
              {filename}
            </h3>
            <div className="flex items-center justify-between text-sm text-ctp-subtext0">
              <Link
                href={`/u/${uploaderUsername}`}
                className="hover:text-accent transition-colors truncate"
                onClick={(e) => e.stopPropagation()}
              >
                by {uploaderName}
              </Link>
              <span>{formatDate(uploadDate)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-ctp-subtext1 mt-1">
              <span>{formatFileSize(fileSize)}</span>
              {width && height && (
                <span>
                  {width} × {height}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
