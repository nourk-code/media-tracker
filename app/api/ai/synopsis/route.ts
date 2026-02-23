import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getCollectionItem,
  updateCollectionItem,
} from "@/lib/supabase/queries";
import {
  generateText,
  isRateLimitError,
  getRetryAfterSeconds,
} from "@/lib/gemini/client";
import { synopsisPrompt } from "@/lib/gemini/prompts";
import { checkRateLimit } from "@/lib/gemini/ratelimit";

export const maxDuration = 30;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await request.json();
  if (!itemId) {
    return NextResponse.json({ error: "itemId required" }, { status: 400 });
  }

  const item = await getCollectionItem(supabase, itemId);
  if (!item || item.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Return cached synopsis if available
  if (item.ai_synopsis) {
    return NextResponse.json({ synopsis: item.ai_synopsis, cached: true });
  }

  const { allowed, retryAfter } = checkRateLimit(user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: `Rate limited. Try again in ${retryAfter}s` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  try {
    const synopsis = await generateText(
      synopsisPrompt({
        title: item.title,
        overview: item.overview ?? "",
        genres: item.genres,
        directors: item.directors,
        release_year: item.release_year,
        media_type: item.media_type,
      })
    );

    const cleaned = synopsis.trim();

    // Cache in DB (best-effort — don't fail the request if this errors)
    try {
      await updateCollectionItem(supabase, itemId, { ai_synopsis: cleaned });
    } catch (dbErr) {
      console.warn("synopsis cache write failed:", dbErr);
    }

    return NextResponse.json({ synopsis: cleaned, cached: false });
  } catch (error) {
    console.error("AI synopsis error:", error);
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
