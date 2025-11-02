"use client";

import { ReactNode } from "react";

interface GalleryGridProps {
  children: ReactNode;
  className?: string;
}

export default function GalleryGrid({
  children,
  className = "",
}: GalleryGridProps) {
  return (
    <div
      className={`grid gap-4 ${className}`}
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gridAutoRows: "10px",
      }}
    >
      {children}
    </div>
  );
}
