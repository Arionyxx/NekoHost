"use client";

import { Input } from "@/components/ui";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: "newest" | "trending";
  onSortChange: (sort: "newest" | "trending") => void;
}

export default function FilterBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
      <div className="w-full sm:w-96">
        <Input
          type="text"
          placeholder="Search by filename or uploader..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onSortChange("newest")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            sortBy === "newest"
              ? "bg-accent text-background"
              : "bg-ctp-surface0 text-foreground hover:bg-ctp-surface1"
          }`}
        >
          Newest
        </button>
        <button
          onClick={() => onSortChange("trending")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            sortBy === "trending"
              ? "bg-accent text-background"
              : "bg-ctp-surface0 text-foreground hover:bg-ctp-surface1"
          }`}
        >
          Trending
        </button>
      </div>
    </div>
  );
}
