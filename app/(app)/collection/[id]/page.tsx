"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { buildPosterUrl, buildBackdropUrl } from "@/lib/tmdb/utils";
import { StatusBadge } from "@/components/media/StatusBadge";
import { EditMediaDialog } from "@/components/media/EditMediaDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import {
  ArrowLeft,
  Star,
  Clock,
  Calendar,
  Sparkles,
  Trash2,
  Edit2,
} from "lucide-react";
import { useDeleteItem } from "@/lib/hooks/useCollection";
import { toast } from "sonner";
import type { CollectionItem } from "@/lib/types/collection";

export default function MediaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const deleteItem = useDeleteItem();
  const [editOpen, setEditOpen] = useState(false);
  const [synopsisLoading, setSynopsisLoading] = useState(false);
  const [synopsis, setSynopsis] = useState<string | null>(null);

  const { data: item, isLoading } = useQuery<CollectionItem>({
    queryKey: ["collection-item", id],
    queryFn: async () => {
      const res = await fetch(`/api/collection/${id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  async function generateSynopsis() {
    if (!item || (synopsis || item.ai_synopsis)) return;
    setSynopsisLoading(true);
    try {
      const res = await fetch("/api/ai/synopsis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });
      const data = await res.json();
      setSynopsis(data.synopsis);
    } catch {
      toast.error("Failed to generate synopsis");
    } finally {
      setSynopsisLoading(false);
    }
  }

  async function handleDelete() {
    if (!item) return;
    if (!confirm(`Remove "${item.title}"?`)) return;
    await deleteItem.mutateAsync(item.id);
    toast.success("Removed from collection");
    router.push("/collection");
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-32 bg-white/5" />
        <Skeleton className="h-64 w-full rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-8 text-center text-gray-400">
        Item not found.
      </div>
    );
  }

  const displaySynopsis = synopsis ?? item.ai_synopsis;

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      {item.backdrop_path && (
        <div className="relative h-72 overflow-hidden">
          <Image
            src={buildBackdropUrl(item.backdrop_path)}
            alt=""
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0f]" />
        </div>
      )}

      <div className="px-8 pb-12" style={{ marginTop: item.backdrop_path ? "-6rem" : "2rem" }}>
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex gap-8">
          {/* Poster */}
          <div className="relative w-48 h-72 flex-shrink-0 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl">
            {item.poster_path ? (
              <Image
                src={buildPosterUrl(item.poster_path, "w342")}
                alt={item.title}
                fill
                className="object-cover"
              />
            ) : null}
          </div>

          {/* Info */}
          <div className="flex-1 pt-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <StatusBadge status={item.status} className="mb-3" />
                <h1 className="text-3xl font-bold text-white mb-1">
                  {item.title}
                </h1>
                {item.original_title && item.original_title !== item.title && (
                  <p className="text-gray-500 text-sm mb-3">
                    {item.original_title}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditOpen(true)}
                  className="border-white/10 text-white hover:bg-white/10"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="border-white/10 text-red-400 hover:bg-red-600/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 mb-4">
              {item.release_year && (
                <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <Calendar className="w-3.5 h-3.5" />
                  {item.release_year}
                </span>
              )}
              {item.runtime_mins && (
                <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <Clock className="w-3.5 h-3.5" />
                  {item.runtime_mins}m
                </span>
              )}
              {item.vote_average && (
                <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <Star className="w-3.5 h-3.5 text-yellow-400" />
                  {item.vote_average.toFixed(1)} TMDB
                </span>
              )}
              {item.user_rating && (
                <span className="flex items-center gap-1.5 text-white text-sm font-medium">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  {item.user_rating}/10 Your rating
                </span>
              )}
            </div>

            {/* Genres */}
            {item.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {item.genres.map((g) => (
                  <span
                    key={g}
                    className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Directors */}
            {item.directors.length > 0 && (
              <p className="text-gray-400 text-sm mb-4">
                <span className="text-gray-600">
                  {item.media_type === "tv" ? "Created by" : "Director"}:
                </span>{" "}
                {item.directors.join(", ")}
              </p>
            )}

            {/* Cast */}
            {item.cast_top5.length > 0 && (
              <p className="text-gray-400 text-sm mb-6">
                <span className="text-gray-600">Cast:</span>{" "}
                {item.cast_top5.join(", ")}
              </p>
            )}

            {/* Overview */}
            {item.overview && (
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                {item.overview}
              </p>
            )}

            {/* User Notes */}
            {item.user_notes && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                <p className="text-gray-500 text-xs mb-1">Your notes</p>
                <p className="text-gray-300 text-sm">{item.user_notes}</p>
              </div>
            )}

            {/* AI Synopsis */}
            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-indigo-300 text-sm font-medium">
                    AI Review
                  </span>
                </div>
                {!displaySynopsis && !synopsisLoading && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={generateSynopsis}
                    className="text-indigo-400 hover:text-indigo-300 text-xs h-auto py-1"
                  >
                    Generate
                  </Button>
                )}
              </div>
              {synopsisLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-white/5" />
                  <Skeleton className="h-4 w-3/4 bg-white/5" />
                </div>
              ) : displaySynopsis ? (
                <p className="text-gray-300 text-sm leading-relaxed">
                  {displaySynopsis}
                </p>
              ) : (
                <p className="text-gray-600 text-sm">
                  Click &quot;Generate&quot; for an AI-written mini review.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <EditMediaDialog item={item} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
