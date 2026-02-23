"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/hooks/useSession";
import { useCollection } from "@/lib/hooks/useCollection";
import { MediaGrid } from "@/components/media/MediaGrid";
import { AddMediaDialog } from "@/components/media/AddMediaDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import type { MediaStatus, MediaType } from "@/lib/types/collection";
import { STATUS_LABELS } from "@/lib/types/collection";

const GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime",
  "Documentary", "Drama", "Fantasy", "Horror", "Mystery",
  "Romance", "Sci-Fi", "Thriller",
];

function CollectionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useSession();
  const [addOpen, setAddOpen] = useState(false);

  const statusFilter = searchParams.get("status") as MediaStatus | undefined;
  const typeFilter = searchParams.get("type") as MediaType | undefined;
  const genreFilter = searchParams.get("genre") ?? undefined;
  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");

  const { data: items, isLoading } = useCollection(user?.id, {
    status: statusFilter || undefined,
    media_type: typeFilter || undefined,
    genre: genreFilter || undefined,
    keyword: keyword || undefined,
  });

  function setFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/collection?${params}`);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">My Collection</h1>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setFilter("q", e.target.value || null);
          }}
          placeholder="Search your collection..."
          className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-600"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {/* Status filters */}
        <button
          onClick={() => setFilter("status", null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            !statusFilter
              ? "bg-indigo-600 border-indigo-600 text-white"
              : "border-white/10 text-gray-400 hover:border-white/30"
          }`}
        >
          All
        </button>
        {(Object.keys(STATUS_LABELS) as MediaStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter("status", statusFilter === s ? null : s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === s
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "border-white/10 text-gray-400 hover:border-white/30"
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}

        <div className="w-px bg-white/10 self-stretch mx-1" />

        {/* Type filters */}
        {(["movie", "tv"] as MediaType[]).map((t) => (
          <button
            key={t}
            onClick={() => setFilter("type", typeFilter === t ? null : t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              typeFilter === t
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "border-white/10 text-gray-400 hover:border-white/30"
            }`}
          >
            {t === "movie" ? "Movies" : "TV Shows"}
          </button>
        ))}

        <div className="w-px bg-white/10 self-stretch mx-1" />

        {/* Genre filters */}
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() =>
              setFilter("genre", genreFilter === g ? null : g)
            }
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              genreFilter === g
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "border-white/10 text-gray-400 hover:border-white/30"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <p className="text-gray-500 text-sm mb-4">
        {isLoading ? "Loading..." : `${items?.length ?? 0} items`}
      </p>

      <MediaGrid
        items={items ?? []}
        loading={isLoading}
        emptyMessage="No items match your filters."
      />

      <AddMediaDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

export default function CollectionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400">Loading...</div>}>
      <CollectionContent />
    </Suspense>
  );
}
