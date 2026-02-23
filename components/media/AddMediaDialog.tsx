"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Tv, Film, Check } from "lucide-react";
import { buildPosterUrl } from "@/lib/tmdb/utils";
import { normalizeMovie, normalizeTV } from "@/lib/tmdb/utils";
import { useAddItem } from "@/lib/hooks/useCollection";
import { useSession } from "@/lib/hooks/useSession";
import { toast } from "sonner";
import type { TMDBSearchResult } from "@/lib/tmdb/types";
import type { TMDBMovie, TMDBTVShow } from "@/lib/tmdb/types";
import type { MediaStatus } from "@/lib/types/collection";
import { STATUS_LABELS } from "@/lib/types/collection";

interface AddMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useState(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  });
  return debounced;
}

export function AddMediaDialog({ open, onOpenChange }: AddMediaDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<TMDBSearchResult | null>(null);
  const [status, setStatus] = useState<MediaStatus>("wishlist");
  const [adding, setAdding] = useState(false);
  const addItem = useAddItem();
  const { user } = useSession();

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleQueryChange = async (q: string) => {
    setQuery(q);
    setSelected(null);
    await search(q);
  };

  async function handleAdd() {
    if (!selected || !user) return;
    setAdding(true);
    try {
      const res = await fetch(
        `/api/tmdb/details?id=${selected.id}&type=${selected.media_type}`
      );
      const details = await res.json();

      const normalized =
        selected.media_type === "movie"
          ? normalizeMovie(details as TMDBMovie, user.id)
          : normalizeTV(details as TMDBTVShow, user.id);

      await addItem.mutateAsync({ ...normalized, status });
      toast.success(`"${selected.title ?? selected.name}" added!`);
      setQuery("");
      setResults([]);
      setSelected(null);
      onOpenChange(false);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to add item";
      toast.error(msg);
    } finally {
      setAdding(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#13131f] border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Add to Collection</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search movies or TV shows..."
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-600"
              autoFocus
            />
          </div>

          {/* Results */}
          {searching && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 bg-white/5 rounded-lg" />
              ))}
            </div>
          )}

          {!searching && results.length > 0 && !selected && (
            <div className="space-y-1.5 max-h-64 overflow-y-auto scrollbar-thin">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => setSelected(result)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/10 transition-colors text-left"
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
                      {(result.release_date ?? result.first_air_date)?.slice(
                        0,
                        4
                      ) ?? "—"}
                    </p>
                  </div>
                  <Plus className="w-4 h-4 text-gray-600 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Selected item */}
          {selected && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/30">
              <div className="relative w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-white/5">
                {selected.poster_path && (
                  <Image
                    src={buildPosterUrl(selected.poster_path, "w92")}
                    alt={selected.title ?? selected.name ?? ""}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {selected.title ?? selected.name}
                </p>
                <p className="text-indigo-400 text-xs">Selected</p>
              </div>
              <Check className="w-4 h-4 text-indigo-400" />
            </div>
          )}

          {/* Status selector */}
          {selected && (
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-sm">Add as</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as MediaStatus)}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-white/10">
                  {(Object.keys(STATUS_LABELS) as MediaStatus[]).map((s) => (
                    <SelectItem key={s} value={s} className="text-white">
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selected && (
            <Button
              onClick={handleAdd}
              disabled={adding}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {adding ? "Adding..." : `Add to Collection`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
