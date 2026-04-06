# attunr

Wellbeing through voice and breathwork — guided somatic exercises for mood, breath, and body awareness. No install, no account. Open the page and begin.

Built with Next.js / Vercel. See [`specs/`](./specs/) for product documentation.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase setup

The app works without Supabase (localStorage-only mode). To enable auth and DB-backed progress:

1. Create a project at [supabase.com](https://supabase.com)
2. Add env vars to `.env.local` (see `.env.example`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
   ```
3. Link your Supabase project and run the migration:
   ```bash
   npx supabase link --project-ref <your-project-ref>
   npm run db:migrate
   ```
   Alternatively, paste `supabase/migrations/001_initial_schema.sql` into the Supabase Dashboard SQL Editor
4. (Optional) Set token expiry to 1 year in Supabase Dashboard → Auth → Settings

## Tech stack

| Concern | Solution |
|---------|----------|
| Framework | Next.js (App Router) + Turbopack |
| Styling | Tailwind CSS v4 |
| Pitch detection | ml5 CREPE (deep-learning, voice-optimised) |
| Tone playback | Web Audio API — binaural beats, synthesised |
| Persistence | localStorage (guest) / Supabase Postgres (logged in) |
| Auth | Supabase magic link (optional — no account required) |
| Deployment | Vercel (push to `main` → auto-deploy) |

## Project structure

```
src/
├── app/                    — Next.js App Router pages + layout
├── components/             — UI components (JourneyView, TrainView, etc.)
├── constants/
│   ├── chakras.ts          — frequency table, voice types, tuning math
│   └── journey/            — 49-stage config (one file per part)
└── hooks/                  — usePitchDetection, useTonePlayer
specs/                      — product specs and design docs
```

## Specs

See [`specs/README.md`](./specs/README.md) for the full index. Key docs:

- [App Overview](./specs/app-overview.md) — vision, tone system, feature status
- [Journey](./specs/journey.md) — 49-stage guided path
- [Tech Stack](./specs/tech-stack.md) — architecture decisions
