import type { CollectionItem } from "@/lib/types/collection";

type MinimalItem = Pick<
  CollectionItem,
  "id" | "title" | "genres" | "status" | "release_year" | "media_type"
>;

export function moodPickerPrompt(
  mood: string,
  items: MinimalItem[]
): string {
  return `You are a movie expert helping someone pick what to watch tonight.

User's mood: "${mood}"

Their collection (JSON):
${JSON.stringify(items, null, 2)}

Pick 3-5 items from their collection that best match this mood. Prioritize items with status "wishlist" or "currently_watching" first.

Respond with ONLY valid JSON. No markdown, no explanation, no code blocks.
Format: {"picks": [{"id": <number>, "reason": "<one sentence why it matches the mood>"}]}`;
}

export function collectionDNAPrompt(stats: {
  totalItems: number;
  topGenres: { genre: string; count: number }[];
  decadeDistribution: { decade: string; count: number }[];
  statusBreakdown: { status: string; count: number }[];
  mediaTypeBreakdown: { type: string; count: number }[];
  avgRating: number | null;
}): string {
  return `You are a film critic who writes playful, insightful viewer profiles.

Here are the stats for a viewer's media collection:
${JSON.stringify(stats, null, 2)}

Write a 3-4 sentence "Collection DNA" taste profile for this viewer. Be engaging, specific, and a little witty. Reference their actual top genres and decades. Do not just list the stats — synthesize them into a personality description.

Respond with ONLY the plain text paragraph. No JSON, no markdown.`;
}

export function synopsisPrompt(media: {
  title: string;
  overview: string;
  genres: string[];
  directors: string[];
  release_year: number | null;
  media_type: string;
}): string {
  return `Write a punchy, opinionated 2-sentence mini review for "${media.title}" (${media.release_year ?? "unknown year"}, ${media.media_type === "tv" ? "TV show" : "film"}).

Genres: ${media.genres.join(", ") || "N/A"}
Created by: ${media.directors.join(", ") || "N/A"}
Plot: ${media.overview}

Tone: enthusiastic film critic, like a friend recommending it. Don't just repeat the plot.

Respond with ONLY the two sentences. No JSON, no markdown, no quotes around the text.`;
}

export function naturalLanguageSearchPrompt(query: string): string {
  return `Convert this natural language query about a personal media collection into a structured JSON filter.

Query: "${query}"

Valid statuses: "owned", "wishlist", "currently_watching", "completed"
Valid media types: "movie", "tv"
Common genres: Action, Comedy, Drama, Horror, Sci-Fi, Thriller, Romance, Animation, Documentary, Fantasy, Crime

Respond with ONLY valid JSON. No markdown, no explanation.
Format: {
  "status": "<status or null>",
  "media_type": "<movie|tv or null>",
  "genres": ["<genre>" or empty array],
  "min_year": <number or null>,
  "max_year": <number or null>,
  "keyword": "<any remaining search term or null>"
}`;
}
