import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({
  children,
  className = "",
  hover = false,
}: CardProps) {
  return (
    <div
      className={`bg-ctp-mantle border border-border rounded-lg p-4 md:p-6 shadow-soft ${
        hover
          ? "transition-all duration-200 hover:shadow-soft-lg hover:border-accent"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
