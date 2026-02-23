"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Brain, Film, Tv, RefreshCw } from "lucide-react";
import { buildPosterUrl } from "@/lib/tmdb/utils";
import { StatusBadge } from "@/components/media/StatusBadge";
import { toast } from "sonner";
import type { CollectionItem } from "@/lib/types/collection";
import Link from "next/link";

interface MoodPick {
  item: CollectionItem;
  reason: string;
}

export default function AIPage() {
  // Mood Picker
  const [mood, setMood] = useState("");
  const [moodLoading, setMoodLoading] = useState(false);
  const [moodPicks, setMoodPicks] = useState<MoodPick[]>([]);

  // DNA
  const [dnaLoading, setDnaLoading] = useState(false);
  const [dna, setDna] = useState<string | null>(null);
  const [dnaCached, setDnaCached] = useState(false);

  async function getMoodPicks() {
    if (mood.trim().length < 3) return;
    setMoodLoading(true);
    setMoodPicks([]);
    try {
      const res = await fetch("/api/ai/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMoodPicks(data.picks ?? []);
      if ((data.picks ?? []).length === 0) {
        toast.info("No matches found. Try adding more items to your collection!");
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed";
      toast.error(msg);
    } finally {
      setMoodLoading(false);
    }
  }

  async function getDNA(force = false) {
    setDnaLoading(true);
    if (force) setDna(null);
    try {
      const res = await fetch("/api/ai/dna", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDna(data.dna);
      setDnaCached(data.cached ?? false);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed";
      toast.error(msg);
    } finally {
      setDnaLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">AI Features</h1>
        <p className="text-gray-400 text-sm">
          Powered by Google Gemini — understands your collection
        </p>
      </div>

      {/* ── Mood Picker ────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              What to Watch Tonight
            </h2>
            <p className="text-gray-500 text-xs">
              Describe your mood — AI picks from your collection
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-5">
          <Input
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && getMoodPicks()}
            placeholder='e.g. "something funny and lighthearted" or "intense thriller"'
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 flex-1"
          />
          <Button
            onClick={getMoodPicks}
            disabled={moodLoading || mood.trim().length < 3}
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            {moodLoading ? "Thinking..." : "Pick for me"}
          </Button>
        </div>

        {moodLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 bg-white/5 rounded-xl" />
            ))}
          </div>
        )}

        {moodPicks.length > 0 && (
          <div className="space-y-3">
            {moodPicks.map(({ item, reason }) => (
              <Link
                key={item.id}
                href={`/collection/${item.id}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/40 transition-colors"
              >
                <div className="relative w-12 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white/5">
                  {item.poster_path ? (
                    <Image
                      src={buildPosterUrl(item.poster_path, "w92")}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : item.media_type === "tv" ? (
                    <Tv className="absolute inset-0 m-auto w-6 h-6 text-gray-600" />
                  ) : (
                    <Film className="absolute inset-0 m-auto w-6 h-6 text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-medium text-sm">
                      {item.title}
                    </p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {reason}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Collection DNA ─────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Collection DNA
              </h2>
              <p className="text-gray-500 text-xs">
                Your viewer taste profile, analyzed by AI
              </p>
            </div>
          </div>
          {dna && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => getDNA(true)}
              disabled={dnaLoading}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Refresh
            </Button>
          )}
        </div>

        {!dna && !dnaLoading && (
          <Button
            onClick={() => getDNA()}
            className="bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30"
          >
            <Brain className="w-4 h-4 mr-2" />
            Analyze My Collection
          </Button>
        )}

        {dnaLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-white/5" />
            <Skeleton className="h-4 w-5/6 bg-white/5" />
            <Skeleton className="h-4 w-4/6 bg-white/5" />
          </div>
        )}

        {dna && !dnaLoading && (
          <div className="bg-purple-600/10 border border-purple-500/20 rounded-2xl p-5">
            <p className="text-gray-200 text-sm leading-relaxed">{dna}</p>
            {dnaCached && (
              <p className="text-gray-600 text-xs mt-3">
                Cached analysis · Refreshes every 24h
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
