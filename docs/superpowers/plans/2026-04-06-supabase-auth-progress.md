# Supabase Auth & Progress Sync — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Supabase auth (magic link) and DB-backed progress/profile sync, with localStorage remaining the default for non-authenticated users.

**Architecture:** `@supabase/ssr` provides browser and server Supabase clients. Next.js middleware refreshes auth tokens. A `useAuth` hook exposes user state. When authenticated, DB is the sole source of truth — localStorage is only for unauthenticated users. A one-time migration merges localStorage → DB on account creation. The DB has two tables: `profiles` and `exercise_completions`, both protected by RLS.

**Tech Stack:** Supabase (Postgres + Auth), `@supabase/ssr`, Next.js 16 middleware, React 19

---

## File Structure

### New files
| File | Responsibility |
|------|---------------|
| `src/lib/supabase/client.ts` | Browser Supabase client singleton |
| `src/lib/supabase/server.ts` | Server Supabase client factory |
| `src/lib/supabase/middleware.ts` | Middleware Supabase client (token refresh) |
| `src/middleware.ts` | Next.js middleware entry point |
| `src/app/auth/callback/route.ts` | Magic link redirect handler |
| `src/hooks/useAuth.ts` | Auth state hook: `{ user, signIn, signOut, isLoading }` |
| `src/lib/supabase/sync.ts` | One-time localStorage → DB migration on account creation |
| `src/components/LoginModal.tsx` | Email input + "check your email" UI |
| `src/components/AuthButton.tsx` | "Log in" / "Log out" button |
| `supabase/migrations/001_initial_schema.sql` | SQL migration for reference |

### Modified files
| File | Change |
|------|--------|
| `package.json` | Add `@supabase/ssr` dependency |
| `src/components/AppShell/AppShell.tsx` | Add AuthButton to header, wire useAuth |
| `src/hooks/useJourneyProgress.ts` | Write to DB when authenticated, localStorage when not |
| `src/hooks/useSettings.ts` | Sync voice type/range to profiles table on account creation |
| `src/context/AppContext.tsx` | Expose auth state in context |

---

### Task 1: Install `@supabase/ssr` and create Supabase client helpers

**Files:**
- Modify: `package.json`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`

- [ ] **Step 1: Install `@supabase/ssr`**

```bash
npm install @supabase/ssr
```

- [ ] **Step 2: Create browser client helper**

Create `src/lib/supabase/client.ts`:

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  );
}
```

- [ ] **Step 3: Create server client helper**

Create `src/lib/supabase/server.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from Server Component — middleware handles refresh
          }
        },
      },
    },
  );
}
```

- [ ] **Step 4: Create middleware client helper**

Create `src/lib/supabase/middleware.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session — must be called even if we don't need the user
  supabase.auth.getUser();

  return supabaseResponse;
}
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/lib/supabase/
git commit -m "feat: add @supabase/ssr and client helpers"
```

---

### Task 2: Next.js middleware and auth callback route

**Files:**
- Create: `src/middleware.ts`
- Create: `src/app/auth/callback/route.ts`

- [ ] **Step 1: Create Next.js middleware**

Create `src/middleware.ts`:

```ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Run on all routes except static files and images
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 2: Create auth callback route**

Create `src/app/auth/callback/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/journey";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect to journey anyway
  return NextResponse.redirect(`${origin}/journey`);
}
```

- [ ] **Step 3: Verify dev server starts without errors**

```bash
npm run dev
```

Expected: Dev server starts, no middleware errors. Visiting any page should work as before.

- [ ] **Step 4: Commit**

```bash
git add src/middleware.ts src/app/auth/callback/
git commit -m "feat: add Next.js middleware and auth callback route"
```

---

### Task 3: Database schema (SQL migration for reference)

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Write the migration SQL**

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- Profiles table — auto-created on user sign-up
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  voice_type text,
  vocal_range_low_hz real,
  vocal_range_high_hz real,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Exercise completions
create table public.exercise_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  chapter_slug text not null,
  stage_slug text not null,
  exercise_slug text not null,
  completed_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, chapter_slug, stage_slug, exercise_slug)
);

alter table public.exercise_completions enable row level security;

create policy "Users can view own completions"
  on public.exercise_completions for select
  using (auth.uid() = user_id);

create policy "Users can insert own completions"
  on public.exercise_completions for insert
  with check (auth.uid() = user_id);

-- Auto-create profile on sign-up
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

-- Auto-update updated_at timestamp
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger exercise_completions_updated_at
  before update on public.exercise_completions
  for each row execute procedure public.set_updated_at();
```

- [ ] **Step 2: Run the migration in Supabase**

Go to Supabase Dashboard → SQL Editor → paste and run the migration SQL. Verify the tables appear under Table Editor.

Alternatively, if using Supabase CLI:
```bash
npx supabase db push
```

- [ ] **Step 3: Commit**

```bash
git add supabase/
git commit -m "feat: add initial Supabase schema migration"
```

---

### Task 4: `useAuth` hook

**Files:**
- Create: `src/hooks/useAuth.ts`

- [ ] **Step 1: Create the useAuth hook**

Create `src/hooks/useAuth.ts`:

```ts
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signIn = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error };
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  return useMemo(
    () => ({ user, isLoading, signIn, signOut, supabase }),
    [user, isLoading, signIn, signOut, supabase],
  );
}

export type AuthHook = ReturnType<typeof useAuth>;
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useAuth.ts
git commit -m "feat: add useAuth hook for Supabase auth"
```

---

### Task 5: LoginModal and AuthButton components

**Files:**
- Create: `src/components/LoginModal.tsx`
- Create: `src/components/AuthButton.tsx`

- [ ] **Step 1: Create LoginModal**

Create `src/components/LoginModal.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Modal, Button, Text } from "@/components/ui";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSignIn: (email: string) => Promise<{ error: Error | null }>;
}

export function LoginModal({ open, onClose, onSignIn }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await onSignIn(email);
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  function handleClose() {
    setEmail("");
    setSent(false);
    setError(null);
    setLoading(false);
    onClose();
  }

  return (
    <Modal onBackdropClick={handleClose}>
      <div className="p-6 flex flex-col gap-4">
        {sent ? (
          <>
            <Text variant="heading-sm">Check your email</Text>
            <Text variant="body-sm">
              We sent a magic link to <strong>{email}</strong>. Click the link
              to sign in.
            </Text>
            <Button variant="ghost" color="subtle" onClick={handleClose}>
              Close
            </Button>
          </>
        ) : (
          <>
            <Text variant="heading-sm">Log in to Attunr</Text>
            <Text variant="body-sm" color="muted-1">
              We&apos;ll send you a magic link — no password needed.
            </Text>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
              />
              {error && (
                <Text variant="caption" color="error">
                  {error}
                </Text>
              )}
              <Button type="submit" disabled={loading || !email}>
                {loading ? "Sending…" : "Send magic link"}
              </Button>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}
```

- [ ] **Step 2: Create AuthButton**

Create `src/components/AuthButton.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { LoginModal } from "./LoginModal";
import type { AuthHook } from "@/hooks/useAuth";

interface AuthButtonProps {
  auth: AuthHook;
}

export function AuthButton({ auth }: AuthButtonProps) {
  const [loginOpen, setLoginOpen] = useState(false);

  if (auth.isLoading) return null;

  if (auth.user) {
    return (
      <Button variant="ghost" color="subtle" size="sm" onClick={() => auth.signOut()}>
        Log out
      </Button>
    );
  }

  return (
    <>
      <Button variant="ghost" color="subtle" size="sm" onClick={() => setLoginOpen(true)}>
        Log in
      </Button>
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSignIn={auth.signIn}
      />
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/LoginModal.tsx src/components/AuthButton.tsx
git commit -m "feat: add LoginModal and AuthButton components"
```

---

### Task 6: Add auth to AppContext

**Files:**
- Modify: `src/context/AppContext.tsx`

- [ ] **Step 1: Add auth type to AppContext**

Replace `src/context/AppContext.tsx` with:

```tsx
"use client";

import { createContext, useContext } from "react";
import type { ColoredNote } from "@/lib/VocalRange";
import type { Settings } from "@/hooks/useSettings";
import type { JourneyProgressHook } from "@/hooks/useJourneyProgress";
import type { AuthHook } from "@/hooks/useAuth";

export interface AppContextValue {
  settings: Settings;
  updateSettings: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  journeyProgress: JourneyProgressHook;
  auth: AuthHook;
  pitchHz: number | null;
  pitchHzRef: React.RefObject<number | null>;
  playTone: (band: ColoredNote) => void;
  playSlide: (fromBand: ColoredNote, toBand: ColoredNote) => void;
  pitchStatus: string;
  startListening: () => void;
  openSettings: () => void;
  triggerNotificationPrompt: () => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppShell");
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/context/AppContext.tsx
git commit -m "feat: add auth type to AppContext"
```

---

### Task 7: Progress sync and DB read/write logic

**Files:**
- Create: `src/lib/supabase/sync.ts`

- [ ] **Step 1: Create the sync module**

Create `src/lib/supabase/sync.ts`:

```ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { JourneyProgressData } from "@/lib/journey-progress";

/**
 * One-time migration: merge localStorage progress into DB on account creation.
 * Only called when the user has zero DB completions (i.e. brand new account).
 */
export async function migrateLocalProgressToDb(
  supabase: SupabaseClient,
  userId: string,
) {
  const raw = localStorage.getItem("attunr.journeyProgress");
  if (!raw) return;

  let localData: JourneyProgressData;
  try {
    localData = JSON.parse(raw);
  } catch {
    return;
  }

  const rows: {
    user_id: string;
    chapter_slug: string;
    stage_slug: string;
    exercise_slug: string;
    completed_at: string;
  }[] = [];

  for (const [chapter, stages] of Object.entries(localData)) {
    for (const [stage, exercises] of Object.entries(stages)) {
      for (const [exercise, progress] of Object.entries(exercises)) {
        if (progress.completed) {
          rows.push({
            user_id: userId,
            chapter_slug: chapter,
            stage_slug: stage,
            exercise_slug: exercise,
            completed_at: new Date(progress.completedAt ?? Date.now()).toISOString(),
          });
        }
      }
    }
  }

  if (rows.length > 0) {
    const { error } = await supabase
      .from("exercise_completions")
      .upsert(rows, {
        onConflict: "user_id,chapter_slug,stage_slug,exercise_slug",
      });

    if (error) {
      console.error("Failed to migrate local progress:", error.message);
    }
  }
}

/**
 * Load all exercise completions from DB into the format useJourneyProgress expects.
 */
export async function loadProgressFromDb(
  supabase: SupabaseClient,
  userId: string,
): Promise<JourneyProgressData> {
  const { data: rows, error } = await supabase
    .from("exercise_completions")
    .select("chapter_slug, stage_slug, exercise_slug, completed_at")
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to load DB progress:", error.message);
    return {};
  }

  const result: JourneyProgressData = {};
  for (const row of rows ?? []) {
    ((result[row.chapter_slug] ??= {})[row.stage_slug] ??= {})[row.exercise_slug] = {
      completed: true,
      completedAt: new Date(row.completed_at).getTime(),
    };
  }
  return result;
}

/**
 * Write a single exercise completion to the DB.
 */
export async function writeCompletionToDb(
  supabase: SupabaseClient,
  userId: string,
  chapterSlug: string,
  stageSlug: string,
  exerciseSlug: string,
  completedAt: number,
) {
  const { error } = await supabase.from("exercise_completions").upsert(
    {
      user_id: userId,
      chapter_slug: chapterSlug,
      stage_slug: stageSlug,
      exercise_slug: exerciseSlug,
      completed_at: new Date(completedAt).toISOString(),
    },
    { onConflict: "user_id,chapter_slug,stage_slug,exercise_slug" },
  );

  if (error) {
    console.error("Failed to write exercise completion:", error.message);
  }
}

/**
 * One-time migration: push localStorage voice/range to DB on account creation.
 * Only updates DB fields that are currently empty.
 */
export async function migrateProfileToDb(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("voice_type, vocal_range_low_hz, vocal_range_high_hz")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Failed to fetch profile:", error.message);
    return;
  }

  const localLowHz = Number(localStorage.getItem("attunr.vocalRangeLowHz")) || 0;
  const localHighHz = Number(localStorage.getItem("attunr.vocalRangeHighHz")) || 0;

  const updates: Record<string, unknown> = {};
  if (!profile.vocal_range_low_hz && localLowHz) updates.vocal_range_low_hz = localLowHz;
  if (!profile.vocal_range_high_hz && localHighHz) updates.vocal_range_high_hz = localHighHz;

  if (Object.keys(updates).length > 0) {
    await supabase.from("profiles").update(updates).eq("id", userId);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/supabase/sync.ts
git commit -m "feat: add DB progress sync and one-time migration logic"
```

---

### Task 8: Wire DB-backed progress into AppShell

**Files:**
- Modify: `src/components/AppShell/AppShell.tsx`

When authenticated, the app should:
1. On first login (account creation): migrate localStorage → DB (one-time)
2. Load progress from DB (every login)
3. Write completions to DB only (not localStorage)

When not authenticated, everything works via localStorage as before.

- [ ] **Step 1: Add imports and auth-aware sync effect**

In `src/components/AppShell/AppShell.tsx`, add imports:

```ts
import { useAuth } from "@/hooks/useAuth";
import { AuthButton } from "../AuthButton";
import {
  migrateLocalProgressToDb,
  migrateProfileToDb,
  loadProgressFromDb,
  writeCompletionToDb,
} from "@/lib/supabase/sync";
import type { ExerciseConfig } from "@/constants/journey";
```

Inside `AppShellInner`, add the hook call after `useTonePlayer`:
```ts
  const auth = useAuth();
```

Add a useEffect that handles first-login migration and loading DB progress:

```ts
  // On auth: migrate local data on first login, then load DB progress
  useEffect(() => {
    if (!auth.user || !auth.supabase) return;

    const userId = auth.user.id;
    const sb = auth.supabase;

    (async () => {
      // Check if this is a new account (zero completions in DB)
      const { count } = await sb
        .from("exercise_completions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);

      if (count === 0) {
        // First login — migrate localStorage to DB
        await migrateLocalProgressToDb(sb, userId);
        await migrateProfileToDb(sb, userId);
      }

      // Load DB progress and apply to JourneyProgress instance
      const dbData = await loadProgressFromDb(sb, userId);
      journeyProgress.progress.loadData(dbData);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user?.id]);
```

Note: This requires adding a `loadData(data)` method to `JourneyProgress` — see Task 8 Step 2.

- [ ] **Step 2: Add `loadData` method to JourneyProgress**

In `src/lib/journey-progress.ts`, add this method to the `JourneyProgress` class, after the `reload()` method:

```ts
  /** Replace progress data with the given data (e.g. loaded from DB). */
  loadData(data: JourneyProgressData): void {
    this.data = data;
  }
```

- [ ] **Step 3: Wrap completeExercise to write to DB when authenticated**

In `src/components/AppShell/AppShell.tsx`, before the `contextValue` object, add:

```ts
  const wrappedJourneyProgress = useMemo(() => ({
    ...journeyProgress,
    completeExercise: (exercise: ExerciseConfig) => {
      journeyProgress.completeExercise(exercise);
      if (auth.user && auth.supabase) {
        writeCompletionToDb(
          auth.supabase,
          auth.user.id,
          exercise.chapterSlug,
          exercise.stageId,
          exercise.slug,
          Date.now(),
        );
      }
    },
  }), [journeyProgress, auth.user, auth.supabase]);
```

In the `contextValue` object, use `wrappedJourneyProgress`:
```ts
    journeyProgress: wrappedJourneyProgress,
```

Also add `auth` to `contextValue`:
```ts
    auth,
```

- [ ] **Step 4: Add AuthButton to header**

In the desktop nav section, before `<StreakBadge />`:
```tsx
            <AuthButton auth={auth} />
```

In the mobile header, before `<StreakBadge />`:
```tsx
            <AuthButton auth={auth} />
```

- [ ] **Step 5: Verify the app runs**

```bash
npm run dev
```

Expected: App renders with "Log in" button. Unauthenticated flow works as before.

- [ ] **Step 6: Commit**

```bash
git add src/components/AppShell/AppShell.tsx src/lib/journey-progress.ts src/context/AppContext.tsx
git commit -m "feat: wire DB-backed progress into AppShell with one-time migration"
```

---

### Task 9: Sync voice type/range on re-detection while logged in

**Files:**
- Modify: `src/components/AppShell/AppShell.tsx`

- [ ] **Step 1: Update handleOnboardingBegin to sync to DB**

In `src/components/AppShell/AppShell.tsx`, modify the `handleOnboardingBegin` function. After the existing `update()` calls, add a DB sync:

```ts
  function handleOnboardingBegin(result: {
    lowHz: number;
    highHz: number;
    voiceType: string;
  }) {
    update("vocalRangeLowHz", result.lowHz);
    update("vocalRangeHighHz", result.highHz);
    setShowOnboarding(false);
    setRedetect(false);
    localStorage.setItem("attunr.onboarded", "1");
    analytics.onboardingCompleted(
      result.voiceType,
      result.lowHz,
      result.highHz,
      hzToNoteName(result.lowHz),
      hzToNoteName(result.highHz),
    );

    // Sync to DB if logged in
    if (auth.user && auth.supabase) {
      auth.supabase
        .from("profiles")
        .update({
          voice_type: result.voiceType,
          vocal_range_low_hz: result.lowHz,
          vocal_range_high_hz: result.highHz,
        })
        .eq("id", auth.user.id)
        .then(({ error }) => {
          if (error) console.error("Failed to sync voice profile:", error.message);
        });
    }
  }
```

- [ ] **Step 2: Verify**

```bash
npm run dev
```

Log in, trigger re-detection via Settings. Confirm the profile row updates in Supabase Table Editor.

- [ ] **Step 3: Commit**

```bash
git add src/components/AppShell/AppShell.tsx
git commit -m "feat: sync voice type and range to DB on re-detection"
```

---

### Task 10: End-to-end manual test

- [ ] **Step 1: Test unauthenticated flow**

1. Clear localStorage
2. Go through onboarding
3. Complete an exercise
4. Verify progress in localStorage
5. Confirm no DB calls are made (no auth)

- [ ] **Step 2: Test first login (account creation with migration)**

1. Complete a few exercises while unauthenticated (localStorage has data)
2. Click "Log in", enter email, receive magic link
3. Click link, verify redirect to `/journey`
4. Verify profile row created in Supabase with voice range from localStorage
5. Verify `exercise_completions` in Supabase contains the localStorage exercises (one-time migration)

- [ ] **Step 3: Test DB-only writes while authenticated**

1. While logged in, complete a new exercise
2. Check Supabase Table Editor — row should appear in `exercise_completions`
3. Progress should be read from DB, not localStorage

- [ ] **Step 4: Test logout**

1. Click "Log out"
2. Complete another exercise
3. Verify it goes to localStorage only, not DB

- [ ] **Step 5: Test subsequent login (no re-migration)**

1. Log back in with the same account
2. Verify progress loads from DB (includes exercises from step 2 & 3)
3. The exercise completed while logged out (step 4) should NOT appear — it's only in localStorage
4. Verify no duplicate migration occurred

- [ ] **Step 6: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors.
