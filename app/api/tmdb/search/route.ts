import { NextResponse } from "next/server";
import { tmdbFetch } from "@/lib/tmdb/client";
import type { TMDBSearchResponse } from "@/lib/tmdb/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const data = await tmdbFetch<TMDBSearchResponse>("/search/multi", {
      query: query.trim(),
      include_adult: "false",
      language: "en-US",
      page: "1",
    });

    // Filter to only movies and TV, exclude results without posters
    const results = data.results
      .filter((r) => r.media_type === "movie" || r.media_type === "tv")
      .slice(0, 10);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("TMDB search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
