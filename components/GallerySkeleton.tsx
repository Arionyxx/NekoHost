"use client";

import { Skeleton } from "@/components/ui";

interface GallerySkeletonProps {
  count?: number;
}

export default function GallerySkeleton({ count = 12 }: GallerySkeletonProps) {
  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-background-mantle rounded-lg overflow-hidden shadow-soft border border-border"
        >
          <Skeleton height="250px" className="w-full" />
          <div className="p-4 space-y-2">
            <Skeleton variant="text" className="w-3/4" />
            <Skeleton variant="text" className="w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
