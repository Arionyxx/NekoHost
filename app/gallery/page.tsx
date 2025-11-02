"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "@/lib/supabase/auth-context";
import ImageCard from "@/components/ImageCard";
import FilterBar from "@/components/FilterBar";
import InfiniteScroll from "@/components/InfiniteScroll";
import GallerySkeleton from "@/components/GallerySkeleton";
import { Badge } from "@/components/ui";

interface ImageData {
  id: string;
  filename: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  created_at: string;
  storage_key: string;
  owner_id: string;
  profiles: {
    display_name: string | null;
    id: string;
  };
}

const IMAGES_PER_PAGE = 20;

export default function GalleryPage() {
  const supabase = useSupabase();
  const [images, setImages] = useState<ImageData[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "trending">("newest");
  const [page, setPage] = useState(0);

  const fetchImages = useCallback(
    async (pageNum: number, reset = false) => {
      try {
        if (pageNum === 0) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const from = pageNum * IMAGES_PER_PAGE;
        const to = from + IMAGES_PER_PAGE - 1;

        let query = supabase
          .from("images")
          .select(
            `
            id,
            filename,
            size_bytes,
            width,
            height,
            created_at,
            storage_key,
            owner_id,
            profiles!images_owner_id_fkey (
              display_name,
              id
            )
          `
          )
          .eq("visibility", "public")
          .order("created_at", { ascending: false })
          .range(from, to);

        const { data, error } = await query;

        if (error) throw error;

        const newImages = (data || []) as ImageData[];

        if (reset) {
          setImages(newImages);
          setFilteredImages(newImages);
        } else {
          setImages((prev) => [...prev, ...newImages]);
          setFilteredImages((prev) => [...prev, ...newImages]);
        }

        setHasMore(newImages.length === IMAGES_PER_PAGE);
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [supabase]
  );

  useEffect(() => {
    fetchImages(0, true);
  }, [fetchImages]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredImages(images);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = images.filter((image) => {
      const filename = image.filename.toLowerCase();
      const uploaderName = (
        image.profiles?.display_name || "Unknown"
      ).toLowerCase();
      return filename.includes(query) || uploaderName.includes(query);
    });

    setFilteredImages(filtered);
  }, [searchQuery, images]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchImages(nextPage, false);
    }
  };

  const getImageUrl = (storageKey: string) => {
    const { data } = supabase.storage.from("images").getPublicUrl(storageKey, {
      transform: {
        width: 600,
        height: 600,
        resize: "contain",
      },
    });
    return data.publicUrl;
  };

  const getUsernameFromEmail = (displayName: string | null, userId: string) => {
    if (displayName) {
      return displayName.toLowerCase().replace(/\s+/g, "-");
    }
    return userId.slice(0, 8);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <Badge variant="accent" className="mb-4">
            Public Gallery
          </Badge>
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Browse Images
          </h1>
          <p className="text-foreground-muted">
            Explore public images shared by our community
          </p>
        </div>
        <GallerySkeleton count={12} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <Badge variant="accent" className="mb-4">
          Public Gallery
        </Badge>
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          Browse Images
        </h1>
        <p className="text-foreground-muted">
          Explore public images shared by our community
        </p>
      </div>

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {filteredImages.length === 0 ? (
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
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            {searchQuery ? "No images found" : "No images yet"}
          </h2>
          <p className="text-foreground-muted mb-6">
            {searchQuery
              ? "Try adjusting your search query"
              : "Be the first to upload an image!"}
          </p>
        </div>
      ) : (
        <>
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            }}
          >
            {filteredImages.map((image) => (
              <ImageCard
                key={image.id}
                id={image.id}
                filename={image.filename}
                uploaderName={image.profiles?.display_name || "Unknown User"}
                uploaderUsername={getUsernameFromEmail(
                  image.profiles?.display_name,
                  image.owner_id
                )}
                fileSize={image.size_bytes}
                uploadDate={image.created_at}
                imageUrl={getImageUrl(image.storage_key)}
                width={image.width || undefined}
                height={image.height || undefined}
              />
            ))}
          </div>

          {!searchQuery && (
            <InfiniteScroll
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              isLoading={isLoadingMore}
            />
          )}
        </>
      )}
    </div>
  );
}
