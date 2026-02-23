# MediaVault — Personal Media Collection Tracker

A full-stack media collection tracker for movies and TV shows, powered by TMDB for metadata and Google Gemini for AI features.

**Live Demo:** *(update after deployment)*
**GitHub:** *(update after pushing)*

---

## Features

### Core
- **Add/Edit/Delete** movies and TV shows with auto-filled metadata from TMDB (poster, cast, genres, runtime, rating)
- **Status Tracking**: Owned · Wishlist · Currently Watching · Completed
- **Smart Filters**: Filter by status, media type (movie/TV), and genre — all URL-bookmarkable
- **Search**: Keyword search across your collection

### AI (Google Gemini)
- **Mood Picker** — Describe your mood, AI picks matching titles from your collection
- **Collection DNA** — AI analyzes your taste and writes a personalized viewer profile
- **AI Mini Reviews** — Gemini writes a punchy 2-sentence review for any item, cached permanently
- **Natural Language Search** — "show me my unwatched sci-fi movies" converts to structured filters

### Social
- **Public Profiles** — Shareable collection page at `/profile/[username]`
- **Google SSO** — One-click sign-in, auto-creates profile
- **Settings** — Toggle public/private, edit display name and username

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (Postgres + RLS) |
| Auth | Supabase Auth (Google SSO) |
| Media API | TMDB API (free) |
| AI | Google Gemini 1.5 Flash (free tier) |
| Deployment | Vercel |

---

## Running Locally

### 1. Clone and install

```bash
git clone <your-repo-url>
cd media-tracker
npm install
```

### 2. Get API keys (all free)

| Service | Where |
|---|---|
| Supabase | supabase.com -> New project |
| TMDB | themoviedb.org/settings/api |
| Gemini | aistudio.google.com |

### 3. Set up .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
TMDB_API_KEY=your_tmdb_v3_key
GEMINI_API_KEY=AIzaSy...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set up Supabase

1. Supabase project -> SQL Editor -> paste and run `supabase/schema.sql`
2. Authentication -> Providers -> Enable Google
3. Add `http://localhost:3000/auth/callback` to redirect URLs

### 5. Run

```bash
npm run dev
```

Open http://localhost:3000

---

## Deployment (Vercel)

1. Push code to GitHub
2. Import project at vercel.com/new
3. Add all env vars in Vercel settings
4. Set NEXT_PUBLIC_APP_URL to your Vercel URL
5. In Supabase Auth: add `https://your-app.vercel.app/auth/callback` to redirect URLs
6. Deploy
