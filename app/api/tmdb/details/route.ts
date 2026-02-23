import { NextResponse } from "next/server";
import { tmdbFetch } from "@/lib/tmdb/client";
import type { TMDBMovie, TMDBTVShow } from "@/lib/tmdb/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");

  if (!id || !type || (type !== "movie" && type !== "tv")) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  try {
    const endpoint = type === "movie" ? `/movie/${id}` : `/tv/${id}`;
    const data = await tmdbFetch<TMDBMovie | TMDBTVShow>(endpoint, {
      append_to_response: "credits",
      language: "en-US",
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("TMDB details error:", error);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
