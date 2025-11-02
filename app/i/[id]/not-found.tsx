import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
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
        <Link href="/gallery">
          <Button variant="primary">Back to Gallery</Button>
        </Link>
      </div>
    </div>
  );
}
