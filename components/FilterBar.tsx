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
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6 px-4">
      <div className="w-full sm:w-96">
        <Input
          type="text"
          placeholder="Search by filename or uploader..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
          aria-label="Search images"
        />
      </div>

      <div className="flex gap-2 w-full sm:w-auto">
        <button
          onClick={() => onSortChange("newest")}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender focus-visible:ring-offset-2 focus-visible:ring-offset-background-crust ${
            sortBy === "newest"
              ? "bg-accent text-background"
              : "bg-ctp-surface0 text-foreground hover:bg-ctp-surface1"
          }`}
          aria-pressed={sortBy === "newest"}
        >
          Newest
        </button>
        <button
          onClick={() => onSortChange("trending")}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender focus-visible:ring-offset-2 focus-visible:ring-offset-background-crust ${
            sortBy === "trending"
              ? "bg-accent text-background"
              : "bg-ctp-surface0 text-foreground hover:bg-ctp-surface1"
          }`}
          aria-pressed={sortBy === "trending"}
        >
          Trending
        </button>
      </div>
    </div>
  );
}
