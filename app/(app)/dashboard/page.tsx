"use client";

import { useState } from "react";
import { useSession } from "@/lib/hooks/useSession";
import { useCollection } from "@/lib/hooks/useCollection";
import { MediaGrid } from "@/components/media/MediaGrid";
import { AddMediaDialog } from "@/components/media/AddMediaDialog";
import { Button } from "@/components/ui/button";
import { Plus, Library, CheckCircle, Eye, BookmarkCheck } from "lucide-react";
import type { MediaStatus } from "@/lib/types/collection";

const STATUS_ICONS: Record<MediaStatus, React.ElementType> = {
  owned: Library,
  wishlist: BookmarkCheck,
  currently_watching: Eye,
  completed: CheckCircle,
};

const STATUS_LABELS_DISPLAY: Record<MediaStatus, string> = {
  owned: "Owned",
  wishlist: "On Wishlist",
  currently_watching: "Watching",
  completed: "Completed",
};

export default function DashboardPage() {
  const { user } = useSession();
  const { data: items, isLoading } = useCollection(user?.id);
  const [addOpen, setAddOpen] = useState(false);

  const stats: { status: MediaStatus; count: number }[] = [
    "owned",
    "wishlist",
    "currently_watching",
    "completed",
  ].map((s) => ({
    status: s as MediaStatus,
    count: items?.filter((i) => i.status === s).length ?? 0,
  }));

  const recent = items?.slice(0, 10) ?? [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {items?.length ?? 0} items in your collection
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Media
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ status, count }) => {
          const Icon = STATUS_ICONS[status];
          return (
            <div
              key={status}
              className="bg-white/5 border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm">
                  {STATUS_LABELS_DISPLAY[status]}
                </span>
                <Icon className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-3xl font-bold text-white">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Recent */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Recently Added
        </h2>
        <MediaGrid items={recent} loading={isLoading} />
      </div>

      <AddMediaDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
