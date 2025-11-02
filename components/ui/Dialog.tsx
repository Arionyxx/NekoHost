"use client";

import React, { useEffect } from "react";
import Button from "./Button";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export default function Dialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
  isLoading = false,
}: DialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: "text-ctp-red",
    warning: "text-ctp-yellow",
    info: "text-ctp-blue",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ctp-crust/80 backdrop-blur-sm animate-overlay-show"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative bg-ctp-base border border-border rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <div className="mb-4">
          <h3
            id="dialog-title"
            className={`text-xl font-semibold mb-2 ${variantStyles[variant]}`}
          >
            {title}
          </h3>
          <p id="dialog-description" className="text-foreground-muted">
            {description}
          </p>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={isLoading}
            className={
              variant === "danger"
                ? "bg-ctp-red hover:bg-ctp-red/90"
                : undefined
            }
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
