export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          is_public: boolean;
          dna_cache_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_public?: boolean;
          dna_cache_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_public?: boolean;
          dna_cache_expires_at?: string | null;
          updated_at?: string;
        };
      };
      collection_items: {
        Row: {
          id: number;
          user_id: string;
          tmdb_id: number;
          media_type: "movie" | "tv";
          title: string;
          original_title: string | null;
          overview: string | null;
          poster_path: string | null;
          backdrop_path: string | null;
          release_year: number | null;
          genres: string[];
          directors: string[];
          cast_top5: string[];
          runtime_mins: number | null;
          vote_average: number | null;
          status: "owned" | "wishlist" | "currently_watching" | "completed";
          user_rating: number | null;
          user_notes: string | null;
          ai_synopsis: string | null;
          date_added: string;
          date_updated: string;
          date_completed: string | null;
        };
        Insert: {
          user_id: string;
          tmdb_id: number;
          media_type: "movie" | "tv";
          title: string;
          original_title?: string | null;
          overview?: string | null;
          poster_path?: string | null;
          backdrop_path?: string | null;
          release_year?: number | null;
          genres?: string[];
          directors?: string[];
          cast_top5?: string[];
          runtime_mins?: number | null;
          vote_average?: number | null;
          status?: "owned" | "wishlist" | "currently_watching" | "completed";
          user_rating?: number | null;
          user_notes?: string | null;
          ai_synopsis?: string | null;
          date_completed?: string | null;
        };
        Update: {
          status?: "owned" | "wishlist" | "currently_watching" | "completed";
          user_rating?: number | null;
          user_notes?: string | null;
          ai_synopsis?: string | null;
          date_completed?: string | null;
        };
      };
      shared_collections: {
        Row: {
          id: string;
          owner_id: string;
          slug: string;
          title: string;
          description: string | null;
          filter_status: string[] | null;
          filter_type: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          owner_id: string;
          slug: string;
          title: string;
          description?: string | null;
          filter_status?: string[] | null;
          filter_type?: string | null;
          is_active?: boolean;
        };
        Update: {
          title?: string;
          description?: string | null;
          filter_status?: string[] | null;
          filter_type?: string | null;
          is_active?: boolean;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      media_type: "movie" | "tv";
      media_status:
        | "owned"
        | "wishlist"
        | "currently_watching"
        | "completed";
    };
  };
};
