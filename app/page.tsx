import Link from "next/link";
import { Film, Sparkles, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Film className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">MediaVault</span>
        </div>
        <Link href="/login">
          <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white">
            Sign in
          </Button>
        </Link>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/30 rounded-full px-4 py-1.5 text-sm text-indigo-300 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Media Tracking
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent leading-tight">
          Your entire media<br />universe, organized.
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Track movies and TV shows, get AI-powered mood-based recommendations,
          and share your taste with the world.
        </p>
        <Link href="/login">
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white h-14 px-8 text-base font-medium">
            Start tracking for free
          </Button>
        </Link>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-8 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Film,
              title: "Rich Metadata",
              desc: "Auto-fill from TMDB — posters, cast, genres, ratings. Add anything instantly.",
            },
            {
              icon: Sparkles,
              title: "AI Features",
              desc: "Mood-based picks, collection DNA analysis, and AI-written mini reviews.",
            },
            {
              icon: Users,
              title: "Share Collections",
              desc: "Public profiles let you share your taste with friends and the world.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search teaser */}
      <div className="max-w-2xl mx-auto px-8 pb-32 text-center">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-500 flex-shrink-0" />
          <span className="text-gray-500 text-sm">
            Try: &ldquo;show me my unwatched sci-fi movies&rdquo; ...
          </span>
        </div>
        <p className="text-gray-600 text-xs mt-3">
          Natural language search powered by Gemini AI
        </p>
      </div>
    </div>
  );
}
