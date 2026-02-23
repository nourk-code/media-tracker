"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  CollectionItem,
  CollectionItemInsert,
  CollectionItemUpdate,
  MediaStatus,
  MediaType,
} from "@/lib/types/collection";

interface Filters {
  status?: MediaStatus;
  media_type?: MediaType;
  genre?: string;
  keyword?: string;
}

export function useCollection(userId: string | undefined, filters?: Filters) {
  return useQuery<CollectionItem[]>({
    queryKey: ["collection", userId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.set("status", filters.status);
      if (filters?.media_type) params.set("media_type", filters.media_type);
      if (filters?.genre) params.set("genre", filters.genre);
      if (filters?.keyword) params.set("keyword", filters.keyword);
      const res = await fetch(`/api/collection?${params}`);
      if (!res.ok) throw new Error("Failed to fetch collection");
      return res.json();
    },
    enabled: !!userId,
  });
}

export function useAddItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: CollectionItemInsert) => {
      const res = await fetch("/api/collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to add item");
      }
      return res.json() as Promise<CollectionItem>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection"] });
    },
  });
}

export function usePatchItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      update,
    }: {
      id: number;
      update: CollectionItemUpdate;
    }) => {
      const res = await fetch(`/api/collection/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      if (!res.ok) throw new Error("Failed to update item");
      return res.json() as Promise<CollectionItem>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection"] });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/collection/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection"] });
    },
  });
}
