import React from "react";
import { Loader } from "./Skeleton";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export default function LoadingOverlay({
  isVisible,
  message = "Loading...",
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ctp-crust/60 backdrop-blur-sm animate-overlay-show">
      <div className="bg-background-mantle border border-border rounded-lg p-8 shadow-soft-lg flex flex-col items-center gap-4 animate-fade-in">
        <Loader size="lg" />
        {message && (
          <p className="text-foreground text-sm font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}
