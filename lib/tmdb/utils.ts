import type { TMDBMovie, TMDBTVShow } from "./types";
import type { CollectionItemInsert } from "@/lib/types/collection";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export type PosterSize =
  | "w92"
  | "w154"
  | "w185"
  | "w342"
  | "w500"
  | "w780"
  | "original";

export function buildPosterUrl(
  path: string | null,
  size: PosterSize = "w500"
): string {
  if (!path) return "/placeholder-poster.svg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function buildBackdropUrl(path: string | null): string {
  if (!path) return "";
  return `${TMDB_IMAGE_BASE}/w1280${path}`;
}

export function extractYear(dateStr: string | undefined | null): number | null {
  if (!dateStr) return null;
  const year = parseInt(dateStr.slice(0, 4));
  return isNaN(year) ? null : year;
}

export function normalizeMovie(
  movie: TMDBMovie,
  userId: string
): CollectionItemInsert {
  const directors =
    movie.credits?.crew
      .filter((c) => c.job === "Director")
      .map((c) => c.name)
      .slice(0, 3) ?? [];

  const cast =
    movie.credits?.cast
      .sort((a, b) => a.order - b.order)
      .map((c) => c.name)
      .slice(0, 5) ?? [];

  return {
    user_id: userId,
    tmdb_id: movie.id,
    media_type: "movie",
    title: movie.title,
    original_title: movie.original_title,
    overview: movie.overview,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_year: extractYear(movie.release_date),
    genres: movie.genres?.map((g) => g.name) ?? [],
    directors,
    cast_top5: cast,
    runtime_mins: movie.runtime,
    vote_average: movie.vote_average,
    status: "wishlist",
  };
}

export function normalizeTV(
  show: TMDBTVShow,
  userId: string
): CollectionItemInsert {
  const directors =
    show.created_by?.map((c) => c.name).slice(0, 3) ?? [];

  const cast =
    show.credits?.cast
      .sort((a, b) => a.order - b.order)
      .map((c) => c.name)
      .slice(0, 5) ?? [];

  const runtime =
    show.episode_run_time?.length > 0 ? show.episode_run_time[0] : null;

  return {
    user_id: userId,
    tmdb_id: show.id,
    media_type: "tv",
    title: show.name,
    original_title: show.original_name,
    overview: show.overview,
    poster_path: show.poster_path,
    backdrop_path: show.backdrop_path,
    release_year: extractYear(show.first_air_date),
    genres: show.genres?.map((g) => g.name) ?? [],
    directors,
    cast_top5: cast,
    runtime_mins: runtime,
    vote_average: show.vote_average,
    status: "wishlist",
  };
}
