import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCollection } from "@/lib/supabase/queries";
import {
  generateText,
  parseGeminiJSON,
  isRateLimitError,
  getRetryAfterSeconds,
} from "@/lib/gemini/client";
import { moodPickerPrompt } from "@/lib/gemini/prompts";
import { checkRateLimit } from "@/lib/gemini/ratelimit";
import type { CollectionItem } from "@/lib/types/collection";

export const maxDuration = 30;

interface MoodPick {
  id: number;
  reason: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed, retryAfter } = checkRateLimit(user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: `Rate limited. Try again in ${retryAfter}s` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const { mood } = await request.json();
  if (!mood || typeof mood !== "string" || mood.trim().length < 3) {
    return NextResponse.json({ error: "Mood required" }, { status: 400 });
  }

  const collection = await getCollection(supabase, user.id);
  if (collection.length === 0) {
    return NextResponse.json({ picks: [] });
  }

  const minimal = collection.map((item) => ({
    id: item.id,
    title: item.title,
    genres: item.genres,
    status: item.status,
    release_year: item.release_year,
    media_type: item.media_type,
  }));

  try {
    const raw = await generateText(moodPickerPrompt(mood, minimal));
    const parsed = parseGeminiJSON<{ picks: MoodPick[] }>(raw);

    const pickedIds = new Set(parsed.picks.map((p) => p.id));
    const itemMap = new Map<number, CollectionItem>(
      collection.map((item) => [item.id, item])
    );

    const results = parsed.picks
      .filter((p) => pickedIds.has(p.id) && itemMap.has(p.id))
      .map((p) => ({
        item: itemMap.get(p.id)!,
        reason: p.reason,
      }));

    return NextResponse.json({ picks: results });
  } catch (error) {
    console.error("AI mood error:", error);
    if (isRateLimitError(error)) {
      const retryAfter = getRetryAfterSeconds(error) ?? 60;
      return NextResponse.json(
        { error: `AI rate limit reached. Try again in ${retryAfter} seconds.` },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
