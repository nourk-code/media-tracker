/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  CollectionItem,
  CollectionItemInsert,
  CollectionItemUpdate,
  MediaStatus,
  MediaType,
  Profile,
  ProfileUpdate,
} from "@/lib/types/collection";

type SupabaseClient = any;

// ── Collection ─────────────────────────────────────────────────

export async function getCollection(
  supabase: SupabaseClient,
  userId: string,
  filters?: {
    status?: MediaStatus;
    media_type?: MediaType;
    genre?: string;
    keyword?: string;
  }
): Promise<CollectionItem[]> {
  let query = supabase
    .from("collection_items")
    .select("*")
    .eq("user_id", userId)
    .order("date_added", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.media_type) query = query.eq("media_type", filters.media_type);
  if (filters?.genre) query = query.contains("genres", [filters.genre]);
  if (filters?.keyword) query = query.ilike("title", `%${filters.keyword}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CollectionItem[];
}

export async function getCollectionItem(
  supabase: SupabaseClient,
  id: number
): Promise<CollectionItem | null> {
  const { data, error } = await supabase
    .from("collection_items")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as CollectionItem;
}

export async function insertCollectionItem(
  supabase: SupabaseClient,
  item: CollectionItemInsert
): Promise<CollectionItem> {
  const { data, error } = await supabase
    .from("collection_items")
    .insert(item)
    .select()
    .single();
  if (error) throw error;
  return data as CollectionItem;
}

export async function updateCollectionItem(
  supabase: SupabaseClient,
  id: number,
  update: CollectionItemUpdate
): Promise<CollectionItem> {
  const { data, error } = await supabase
    .from("collection_items")
    .update(update)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as CollectionItem;
}

export async function deleteCollectionItem(
  supabase: SupabaseClient,
  id: number
): Promise<void> {
  const { error } = await supabase
    .from("collection_items")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function getPublicCollection(
  supabase: SupabaseClient,
  userId: string
): Promise<CollectionItem[]> {
  const { data, error } = await supabase
    .from("collection_items")
    .select("*")
    .eq("user_id", userId)
    .order("date_added", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CollectionItem[];
}

// ── Profiles ────────────────────────────────────────────────────

export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data as Profile;
}

export async function getProfileByUsername(
  supabase: SupabaseClient,
  username: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();
  if (error) return null;
  return data as Profile;
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  update: ProfileUpdate
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}
