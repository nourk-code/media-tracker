import type { Database } from "./database";

export type CollectionItem =
  Database["public"]["Tables"]["collection_items"]["Row"];
export type CollectionItemInsert =
  Database["public"]["Tables"]["collection_items"]["Insert"];
export type CollectionItemUpdate =
  Database["public"]["Tables"]["collection_items"]["Update"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate =
  Database["public"]["Tables"]["profiles"]["Update"];
export type SharedCollection =
  Database["public"]["Tables"]["shared_collections"]["Row"];

export type MediaType = "movie" | "tv";
export type MediaStatus =
  | "owned"
  | "wishlist"
  | "currently_watching"
  | "completed";

export const STATUS_LABELS: Record<MediaStatus, string> = {
  owned: "Owned",
  wishlist: "Wishlist",
  currently_watching: "Watching",
  completed: "Completed",
};

export const STATUS_COLORS: Record<MediaStatus, string> = {
  owned: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  wishlist: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  currently_watching: "bg-green-500/20 text-green-400 border-green-500/30",
  completed: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};
