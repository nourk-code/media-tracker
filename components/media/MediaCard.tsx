"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Trash2, Edit2, Tv, Film } from "lucide-react";
import { buildPosterUrl } from "@/lib/tmdb/utils";
import { StatusBadge } from "./StatusBadge";
import type { CollectionItem } from "@/lib/types/collection";
import { useDeleteItem } from "@/lib/hooks/useCollection";
import { toast } from "sonner";
import { useState } from "react";
import { EditMediaDialog } from "./EditMediaDialog";

interface MediaCardProps {
  item: CollectionItem;
  readOnly?: boolean;
}

export function MediaCard({ item, readOnly = false }: MediaCardProps) {
  const deleteItem = useDeleteItem();
  const [editOpen, setEditOpen] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Remove "${item.title}" from your collection?`)) return;
    await deleteItem.mutateAsync(item.id);
    toast.success(`"${item.title}" removed`);
  }

  return (
    <>
      <Link href={`/collection/${item.id}`} className="group relative block">
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 border border-white/10 transition-all duration-200 group-hover:border-indigo-500/50 group-hover:scale-[1.02]">
          {item.poster_path ? (
            <Image
              src={buildPosterUrl(item.poster_path, "w342")}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {item.media_type === "tv" ? (
                <Tv className="w-12 h-12 text-gray-600" />
              ) : (
                <Film className="w-12 h-12 text-gray-600" />
              )}
            </div>
          )}

          {/* Overlay on hover */}
          {!readOnly && (
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditOpen(true);
                }}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-indigo-600 flex items-center justify-center transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={handleDelete}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-red-600 flex items-center justify-center transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          {/* Status badge */}
          <div className="absolute top-2 left-2">
            <StatusBadge status={item.status} />
          </div>

          {/* Rating */}
          {item.user_rating && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 rounded-full px-2 py-0.5">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-white text-xs font-medium">
                {item.user_rating}
              </span>
            </div>
          )}
        </div>

        {/* Info below card */}
        <div className="mt-2 px-0.5">
          <p className="text-white text-sm font-medium truncate leading-tight">
            {item.title}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">
            {item.release_year ?? "—"}
            {item.media_type === "tv" && (
              <span className="ml-1 text-indigo-400">TV</span>
            )}
          </p>
        </div>
      </Link>

      {!readOnly && (
        <EditMediaDialog item={item} open={editOpen} onOpenChange={setEditOpen} />
      )}
    </>
  );
}
