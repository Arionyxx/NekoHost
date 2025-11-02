import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info" | "accent";
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  const variantStyles = {
    default: "bg-ctp-surface1 text-ctp-text",
    success: "bg-ctp-green/20 text-ctp-green border border-ctp-green/30",
    warning: "bg-ctp-yellow/20 text-ctp-yellow border border-ctp-yellow/30",
    error: "bg-ctp-red/20 text-ctp-red border border-ctp-red/30",
    info: "bg-ctp-blue/20 text-ctp-blue border border-ctp-blue/30",
    accent: "bg-ctp-mauve/20 text-ctp-mauve border border-ctp-mauve/30",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
