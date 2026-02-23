import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCollection, updateProfile, getProfile } from "@/lib/supabase/queries";
import {
  generateText,
  isRateLimitError,
  getRetryAfterSeconds,
} from "@/lib/gemini/client";
import { collectionDNAPrompt } from "@/lib/gemini/prompts";
import { checkRateLimit } from "@/lib/gemini/ratelimit";

export const maxDuration = 30;

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check cache — only regenerate if expired
  const profile = await getProfile(supabase, user.id);
  if (
    profile?.bio &&
    profile.dna_cache_expires_at &&
    new Date(profile.dna_cache_expires_at) > new Date()
  ) {
    return NextResponse.json({ dna: profile.bio, cached: true });
  }

  const { allowed, retryAfter } = checkRateLimit(user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: `Rate limited. Try again in ${retryAfter}s` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const collection = await getCollection(supabase, user.id);
  if (collection.length < 3) {
    return NextResponse.json({
      dna: "Add at least 3 items to your collection to get your DNA analysis!",
    });
  }

  // Compute stats server-side to reduce tokens
  const genreCount: Record<string, number> = {};
  const decadeCount: Record<string, number> = {};
  const statusCount: Record<string, number> = {};
  const typeCount: Record<string, number> = {};
  let ratingSum = 0;
  let ratingCount = 0;

  for (const item of collection) {
    item.genres.forEach((g) => {
      genreCount[g] = (genreCount[g] ?? 0) + 1;
    });

    if (item.release_year) {
      const decade = `${Math.floor(item.release_year / 10) * 10}s`;
      decadeCount[decade] = (decadeCount[decade] ?? 0) + 1;
    }

    statusCount[item.status] = (statusCount[item.status] ?? 0) + 1;
    typeCount[item.media_type] = (typeCount[item.media_type] ?? 0) + 1;

    if (item.user_rating) {
      ratingSum += item.user_rating;
      ratingCount++;
    }
  }

  const stats = {
    totalItems: collection.length,
    topGenres: Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count })),
    decadeDistribution: Object.entries(decadeCount)
      .sort((a, b) => b[1] - a[1])
      .map(([decade, count]) => ({ decade, count })),
    statusBreakdown: Object.entries(statusCount).map(([status, count]) => ({
      status,
      count,
    })),
    mediaTypeBreakdown: Object.entries(typeCount).map(([type, count]) => ({
      type,
      count,
    })),
    avgRating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : null,
  };

  try {
    const dna = await generateText(collectionDNAPrompt(stats));

    // Cache for 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await updateProfile(supabase, user.id, {
      bio: dna.trim(),
      dna_cache_expires_at: expiresAt,
    });

    return NextResponse.json({ dna: dna.trim(), cached: false });
  } catch (error) {
    console.error("AI DNA error:", error);
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
