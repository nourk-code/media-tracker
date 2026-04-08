"use client";

import Link from "next/link";
import { Film, Sparkles, Users, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const faqs = [
  {
    question: "Is MediaVault free to use?",
    answer: "Yes, MediaVault is completely free. Create an account and start tracking your movies and TV shows instantly.",
  },
  {
    question: "How does the AI recommendation work?",
    answer: "You describe your mood or what you're in the mood for, and our Gemini-powered AI scans your collection and suggests the best match.",
  },
  {
    question: "Can I share my collection with others?",
    answer: "Absolutely. Every account has a public profile page where others can browse your watchlist, ratings, and reviews.",
  },
  {
    question: "Where does the movie and show data come from?",
    answer: "We pull metadata, posters, cast info, and ratings directly from The Movie Database (TMDB).",
  },
  {
    question: "Can I track both movies and TV shows?",
    answer: "Yes. You can log movies and full TV series, mark individual episodes as watched, and rate each separately.",
  },
];

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

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-8 pb-16">
        <div className="grid grid-cols-3 gap-6 text-center">
          {[
            { value: "10K+", label: "Movies tracked" },
            { value: "500+", label: "Active users" },
            { value: "50K+", label: "Reviews written" },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-3xl font-bold text-indigo-400 mb-1">{value}</div>
              <div className="text-gray-400 text-sm">{label}</div>
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
      {/* Testimonials */}
      <div className="max-w-5xl mx-auto px-8 pb-20">
        <h2 className="text-2xl font-bold text-center text-white mb-10">What users are saying</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Alex M.", text: "Finally an app that keeps all my watchlists in one place. Love the AI recommendations." },
            { name: "Sara K.", text: "The mood-based picks are scary accurate. It recommended exactly what I needed on a rainy day." },
            { name: "James T.", text: "Clean UI, fast, and the public profiles make it easy to share my taste with friends." },
          ].map(({ name, text }) => (
            <div key={name} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-gray-300 text-sm leading-relaxed mb-4">&ldquo;{text}&rdquo;</p>
              <span className="text-indigo-400 text-sm font-medium">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-8 pb-24">
        <h2 className="text-2xl font-bold text-center text-white mb-10">Frequently asked questions</h2>
        <div className="space-y-3">
          {faqs.map(({ question, answer }) => {
            const [open, setOpen] = useState(false);
            return (
              <div key={question} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpen(!open)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left text-white font-medium hover:bg-white/5 transition-colors"
                >
                  <span>{question}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
                {open && (
                  <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">
                    {answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 py-6 text-center text-gray-600 text-xs">
        © {new Date().getFullYear()} MediaVault. All rights reserved. · Built with Next.js
      </footer>
    </div>
  );
}
