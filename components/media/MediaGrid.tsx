import { MediaCard } from "./MediaCard";
import type { CollectionItem } from "@/lib/types/collection";
import { Skeleton } from "@/components/ui/skeleton";

interface MediaGridProps {
  items: CollectionItem[];
  loading?: boolean;
  readOnly?: boolean;
  emptyMessage?: string;
}

export function MediaGrid({
  items,
  loading,
  readOnly,
  emptyMessage = "No items found.",
}: MediaGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="aspect-[2/3] w-full rounded-xl bg-white/5" />
            <Skeleton className="h-4 w-3/4 mt-2 rounded bg-white/5" />
            <Skeleton className="h-3 w-1/2 mt-1 rounded bg-white/5" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} readOnly={readOnly} />
      ))}
    </div>
  );
}
