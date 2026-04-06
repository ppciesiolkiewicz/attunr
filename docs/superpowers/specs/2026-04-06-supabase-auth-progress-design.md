# Supabase Auth & Progress Sync

## Goal

Add a basic database layer using Supabase to persist user progress and settings. This is a foundation for future features (accounts, social, coaching). Signing up is not mandatory — localStorage remains the default, and DB sync only activates when a user explicitly logs in.

## Stack

- **Supabase** (hosted Postgres + auth)
- **`@supabase/ssr`** — Next.js integration (server client, browser client, middleware)
- **Magic link auth** — login and sign-up are the same flow
- **1-year token expiry** — configured in Supabase dashboard

## Database Schema

### `profiles`

Created automatically via a Postgres trigger on `auth.users` insert.

| Column              | Type          | Notes                          |
|---------------------|---------------|--------------------------------|
| `id`                | `uuid` PK     | References `auth.users.id`    |
| `voice_type`        | `text`         | e.g. "baritone", nullable     |
| `vocal_range_low_hz`| `real`         | From onboarding detection     |
| `vocal_range_high_hz`| `real`        | From onboarding detection     |
| `created_at`        | `timestamptz`  | Default `now()`               |
| `updated_at`        | `timestamptz`  | Default `now()`, auto-updated |

### `exercise_completions`

One row per completed exercise.

| Column          | Type          | Notes                                    |
|-----------------|---------------|------------------------------------------|
| `id`            | `uuid` PK     | Default `gen_random_uuid()`             |
| `user_id`       | `uuid` FK      | References `profiles.id`               |
| `chapter_slug`  | `text`         | e.g. `"chapter-8"`                     |
| `stage_slug`    | `text`         | e.g. `"warmup"`                        |
| `exercise_slug` | `text`         | e.g. `"ch8-warmup-sss-zzz"`           |
| `completed_at`  | `timestamptz`  | When the user completed it              |
| `created_at`    | `timestamptz`  | Default `now()`                         |
| `updated_at`    | `timestamptz`  | Default `now()`, auto-updated           |

Unique constraint on `(user_id, chapter_slug, stage_slug, exercise_slug)`.

### Row Level Security

Both tables have RLS enabled. Policies:
- `profiles`: users can read/update their own row only (`auth.uid() = id`)
- `exercise_completions`: users can read/insert their own rows only (`auth.uid() = user_id`)

### Trigger: auto-create profile

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Auth Flow

1. User taps "Log in" button in the app shell header
2. A modal opens with an email input
3. Client calls `supabase.auth.signInWithOtp({ email })` — Supabase sends the magic link
4. Modal shows "Check your email" confirmation
5. User clicks the magic link -> redirected to `/auth/callback`
6. Callback route exchanges the auth code for a session, redirects to `/`
7. Next.js middleware refreshes the session on every request

**Logout:** "Log out" button calls `supabase.auth.signOut()`. User returns to localStorage-only mode.

**Token expiry:** 1 year, configured in the Supabase dashboard (not in code).

## Progress Sync

### On first login (account creation)

1. Read localStorage progress (`attunr.journeyProgress`)
2. Merge into DB via upsert — this is a one-time migration
3. DB becomes the source of truth going forward

### On subsequent logins

- Read from DB only, localStorage progress is ignored
- No merge — the one-time migration already happened at account creation

### Ongoing (while logged in)

- DB is the sole source of truth for progress
- Exercise completions write directly to DB
- localStorage is not used for progress while authenticated

### On logout

- Falls back to localStorage (starts fresh locally)
- DB progress is preserved for next login

### Voice type & vocal range sync

- On login: sync `voice_type`, `vocal_range_low_hz`, `vocal_range_high_hz` from localStorage to `profiles` (prefer existing DB values if present, otherwise push local values)
- On re-detection (re-onboarding while logged in): update both localStorage and DB

## File Structure

### New files

```
src/lib/supabase/
  client.ts            — createBrowserClient helper
  server.ts            — createServerClient helper
  middleware.ts         — session refresh middleware helper

src/middleware.ts       — Next.js middleware entry point

src/app/auth/
  callback/route.ts    — magic link redirect handler

src/hooks/
  useAuth.ts           — { user, signIn, signOut, isLoading }

src/components/
  AuthButton.tsx        — "Log in" / "Log out" toggle for app shell
  LoginModal.tsx        — email input + "check your email" state
```

### Modified files

- `src/components/AppShell/AppShell.tsx` — add AuthButton to header
- `src/hooks/useJourneyProgress.ts` — dual-write to DB when logged in
- `src/hooks/useSettings.ts` — sync voice type/range to profiles table
- `.env.local` — add Supabase env vars (already present)
- `package.json` — add `@supabase/ssr`

## UI

### AuthButton

- **Logged out:** shows "Log in" text button in the app shell corner
- **Logged in:** shows "Log out" text button (or user email + logout)

### LoginModal

- Single email input field
- "Send magic link" button
- After sending: "Check your email" message with option to close
- Minimal styling, uses existing UI atoms (Modal, Button, Text)

## Out of Scope (V1)

- Profile/settings page
- Display name
- Account deletion
- Password auth / OAuth
- Offline queue (if DB write fails, it just fails silently — localStorage is the safety net)
- Real-time subscriptions
- Migration tooling for existing localStorage-only users (sync happens naturally on first login)
