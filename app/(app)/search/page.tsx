"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Sparkles, Plus, Tv, Film } from "lucide-react";
import { buildPosterUrl } from "@/lib/tmdb/utils";
import { normalizeMovie, normalizeTV } from "@/lib/tmdb/utils";
import { useAddItem } from "@/lib/hooks/useCollection";
import { useSession } from "@/lib/hooks/useSession";
import { toast } from "sonner";
import { MediaGrid } from "@/components/media/MediaGrid";
import type { TMDBSearchResult, TMDBMovie, TMDBTVShow } from "@/lib/tmdb/types";
import type { CollectionItem } from "@/lib/types/collection";

interface AppliedFilters {
  status: string | null;
  media_type: string | null;
  genres: string[];
  min_year: number | null;
  max_year: number | null;
  keyword: string | null;
}

export default function SearchPage() {
  const [mode, setMode] = useState<"add" | "nl">("add");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBSearchResult[]>([]);
  const [nlResults, setNlResults] = useState<CollectionItem[]>([]);
  const [nlFilters, setNlFilters] = useState<AppliedFilters | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState<Set<number>>(new Set());
  const addItem = useAddItem();
  const { user } = useSession();

  async function handleTMDBSearch() {
    if (query.trim().length < 2) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function handleNLSearch() {
    if (query.trim().length < 2) return;
    setLoading(true);
    setHasSearched(false);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setNlResults(data.results ?? []);
      setNlFilters(data.filters ?? null);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddFromTMDB(result: TMDBSearchResult) {
    if (!user) return;
    try {
      const res = await fetch(
        `/api/tmdb/details?id=${result.id}&type=${result.media_type}`
      );
      const details = await res.json();
      const normalized =
        result.media_type === "movie"
          ? normalizeMovie(details as TMDBMovie, user.id)
          : normalizeTV(details as TMDBTVShow, user.id);
      await addItem.mutateAsync(normalized);
      setAdded((prev) => new Set(prev).add(result.id));
      toast.success(`"${result.title ?? result.name}" added to wishlist!`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to add";
      toast.error(msg);
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-6">Search</h1>

      <Tabs value={mode} onValueChange={(v) => { setMode(v as "add" | "nl"); setNlResults([]); setNlFilters(null); setHasSearched(false); setResults([]); }}>
        <TabsList className="bg-white/5 border border-white/10 mb-6">
          <TabsTrigger
            value="add"
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400"
          >
            <Film className="w-3.5 h-3.5 mr-2" />
            Add from TMDB
          </TabsTrigger>
          <TabsTrigger
            value="nl"
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400"
          >
            <Sparkles className="w-3.5 h-3.5 mr-2" />
            Search My Collection (AI)
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search bar */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                mode === "add" ? handleTMDBSearch() : handleNLSearch();
              }
            }}
            placeholder={
              mode === "add"
                ? "Search movies or TV shows..."
                : 'e.g. "show me my unwatched sci-fi movies"'
            }
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-600"
          />
        </div>
        <Button
          onClick={mode === "add" ? handleTMDBSearch : handleNLSearch}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          {mode === "nl" && <Sparkles className="w-4 h-4 mr-2" />}
          Search
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 bg-white/5 rounded-xl" />
          ))}
        </div>
      )}

      {/* TMDB Results */}
      {!loading && mode === "add" && results.length > 0 && (
        <div className="space-y-2">
          <p className="text-gray-500 text-sm mb-3">
            {results.length} results from TMDB
          </p>
          {results.map((result) => (
            <div
              key={result.id}
              className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="relative w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-white/5">
                {result.poster_path ? (
                  <Image
                    src={buildPosterUrl(result.poster_path, "w92")}
                    alt={result.title ?? result.name ?? ""}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {result.media_type === "tv" ? (
                      <Tv className="w-5 h-5 text-gray-600" />
                    ) : (
                      <Film className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {result.title ?? result.name}
                </p>
                <p className="text-gray-500 text-xs">
                  {result.media_type === "tv" ? "TV Show" : "Movie"} ·{" "}
                  {(result.release_date ?? result.first_air_date)?.slice(0, 4) ??
                    "—"}{" "}
                  · ⭐ {result.vote_average?.toFixed(1)}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleAddFromTMDB(result)}
                disabled={added.has(result.id)}
                className={
                  added.has(result.id)
                    ? "bg-green-600/20 text-green-400 border-green-600/30 border"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white"
                }
              >
                {added.has(result.id) ? (
                  "Added"
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* NL Results */}
      {!loading && mode === "nl" && hasSearched && (
        <div>
          {/* Applied filters summary */}
          {nlFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {nlFilters.status && (
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
                  Status: {nlFilters.status.replace("_", " ")}
                </span>
              )}
              {nlFilters.media_type && (
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
                  Type: {nlFilters.media_type === "tv" ? "TV Show" : "Movie"}
                </span>
              )}
              {nlFilters.genres.map((g) => (
                <span key={g} className="text-xs px-2 py-1 rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
                  {g}
                </span>
              ))}
              {nlFilters.min_year && (
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
                  From {nlFilters.min_year}
                </span>
              )}
              {nlFilters.max_year && (
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
                  Until {nlFilters.max_year}
                </span>
              )}
              {nlFilters.keyword && (
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
                  &ldquo;{nlFilters.keyword}&rdquo;
                </span>
              )}
            </div>
          )}

          {nlResults.length > 0 ? (
            <>
              <p className="text-gray-500 text-sm mb-4">
                {nlResults.length} item{nlResults.length !== 1 ? "s" : ""} matched in your collection
              </p>
              <MediaGrid items={nlResults} />
            </>
          ) : (
            <p className="text-gray-500 text-center py-12">
              No items in your collection matched that search. Try rephrasing or broadening your query.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
