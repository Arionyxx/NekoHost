"use client";

import { useEffect, useRef } from "react";
import { Loader } from "@/components/ui";

interface InfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

export default function InfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
}: InfiniteScrollProps) {
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoading, onLoadMore]);

  if (!hasMore && !isLoading) {
    return null;
  }

  return (
    <div
      ref={observerRef}
      className="flex justify-center items-center py-8 w-full"
    >
      {isLoading && <Loader size="lg" />}
    </div>
  );
}
