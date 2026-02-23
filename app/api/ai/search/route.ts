import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCollection } from "@/lib/supabase/queries";
import {
  generateText,
  parseGeminiJSON,
  isRateLimitError,
  getRetryAfterSeconds,
} from "@/lib/gemini/client";
import { naturalLanguageSearchPrompt } from "@/lib/gemini/prompts";
import { checkRateLimit } from "@/lib/gemini/ratelimit";
import type { MediaStatus, MediaType } from "@/lib/types/collection";

export const maxDuration = 30;

interface SearchFilter {
  status: MediaStatus | null;
  media_type: MediaType | null;
  genres: string[];
  min_year: number | null;
  max_year: number | null;
  keyword: string | null;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { query } = await request.json();
  if (!query || typeof query !== "string" || query.trim().length < 2) {
    return NextResponse.json({ error: "Query required" }, { status: 400 });
  }

  const { allowed, retryAfter } = checkRateLimit(user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: `Rate limited. Try again in ${retryAfter}s` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  let filters: SearchFilter = {
    status: null,
    media_type: null,
    genres: [],
    min_year: null,
    max_year: null,
    keyword: null,
  };

  try {
    const raw = await generateText(naturalLanguageSearchPrompt(query));
    filters = parseGeminiJSON<SearchFilter>(raw);
  } catch (error) {
    if (isRateLimitError(error)) {
      const retryAfter = getRetryAfterSeconds(error) ?? 60;
      return NextResponse.json(
        { error: `AI rate limit reached. Try again in ${retryAfter} seconds.` },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }
    // Fall back to keyword search if Gemini fails or returns bad JSON
    filters.keyword = query;
  }

  // Fetch full collection then filter in memory
  const collection = await getCollection(supabase, user.id);

  const results = collection.filter((item) => {
    if (filters.status && item.status !== filters.status) return false;
    if (filters.media_type && item.media_type !== filters.media_type)
      return false;
    if (
      filters.genres.length > 0 &&
      !filters.genres.some((filterGenre) => {
        const fl = filterGenre.toLowerCase().replace(/[^a-z0-9]/g, "");
        return item.genres.some((itemGenre) => {
          const il = itemGenre.toLowerCase().replace(/[^a-z0-9]/g, "");
          return il.includes(fl) || fl.includes(il);
        });
      })
    )
      return false;
    if (filters.min_year && item.release_year && item.release_year < filters.min_year)
      return false;
    if (filters.max_year && item.release_year && item.release_year > filters.max_year)
      return false;
    if (
      filters.keyword &&
      !item.title.toLowerCase().includes(filters.keyword.toLowerCase()) &&
      !item.overview?.toLowerCase().includes(filters.keyword.toLowerCase())
    )
      return false;
    return true;
  });

  return NextResponse.json({ results, filters });
}
