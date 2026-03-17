# Chapter as Atomic Unit — Journey Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rethink the journey page so chapters are the atomic unit — chapter cards on `/journey`, chapter detail at `/ch/[ch]`, exercises at `/ch/[ch]/[ex]`. Preserve current journey at `/journey2`.

**Architecture:** Add `description` to Chapter types and a `resolveExerciseRoute` helper to the Journey class for mapping between global IDs and `{ ch, ex }` pairs. Create three new component directories (ChapterList, ChapterDetail, ChapterExercise) and four new route pages. Move existing journey to `/journey2` and update all exercise links to use the new `/ch/[ch]/[ex]` scheme.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-03-17-chapter-atomic-journey-design.md`

---

### Task 1: Add `description` to Chapter types and config

**Files:**
- Modify: `src/constants/journey/types.ts:316-336`
- Modify: `src/constants/journey/index.ts:5-8`

- [ ] **Step 1: Add `description` to `Chapter` and `ChapterInput` types**

In `src/constants/journey/types.ts`, add `description: string` to both interfaces:

```ts
// Chapter (line ~316)
export interface Chapter {
  chapter: number;
  title: string;
  description: string;
  warmup?: StageConfig;
  stages: StageConfig[];
}

// ChapterInput (line ~331)
export interface ChapterInput {
  chapter: number;
  title: string;
  description: string;
  warmup?: StageConfigInput;
  stages: StageConfigInput[];
}
```

- [ ] **Step 2: Add descriptions to chapter configs**

In `src/constants/journey/index.ts`, add descriptions to the Journey constructor:

```ts
export const journey = new Journey([
  {
    chapter: 1,
    title: "Introduction",
    description: "Discover your voice, feel vibrations, match tones, and find your breath.",
    stages: CHAPTER_1_STAGES,
  },
  {
    chapter: 2,
    title: "Building Foundation",
    description: "Expand your range, build resonance, and develop vowel control.",
    warmup: CHAPTER_2_WARMUP,
    stages: CHAPTER_2_STAGES,
  },
]);
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build 2>&1 | tail -20`
Expected: no type errors related to `description`

- [ ] **Step 4: Commit**

```bash
git add src/constants/journey/types.ts src/constants/journey/index.ts
git commit -m "feat: add description field to Chapter types"
```

---

### Task 2: Add route resolution helpers to Journey class

**Files:**
- Modify: `src/constants/journey/Journey.ts`

- [ ] **Step 1: Add `exerciseRoute` and `exerciseByRoute` methods to Journey class**

In `src/constants/journey/Journey.ts`, add these methods to the `Journey` class:

```ts
/** Get all exercises in a chapter as a flat array (warmup + stages). */
getChapterExercises(chapterNum: number): ExerciseConfig[] {
  const chapter = this.chapters.find((ch) => ch.chapter === chapterNum);
  if (!chapter) return [];
  const stages = chapter.warmup ? [chapter.warmup, ...chapter.stages] : chapter.stages;
  return stages.flatMap((s) => s.exercises);
}

/** Resolve a global exercise ID to { ch, ex } route params. */
exerciseRoute(globalId: number): { ch: number; ex: number } | null {
  for (const chapter of this.chapters) {
    const exercises = this.getChapterExercises(chapter.chapter);
    const idx = exercises.findIndex((e) => e.id === globalId);
    if (idx !== -1) return { ch: chapter.chapter, ex: idx + 1 };
  }
  return null;
}

/** Resolve { ch, ex } route params to a global exercise ID. */
exerciseByRoute(ch: number, ex: number): ExerciseConfig | null {
  const exercises = this.getChapterExercises(ch);
  return exercises[ex - 1] ?? null;
}

/** Build the URL path for an exercise given its global ID. */
exerciseHref(globalId: number): string {
  const route = this.exerciseRoute(globalId);
  if (!route) return "/journey";
  return `/ch/${route.ch}/${route.ex}`;
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build 2>&1 | tail -20`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/constants/journey/Journey.ts
git commit -m "feat: add route resolution helpers to Journey class"
```

---

### Task 3: Move current journey to `/journey2`

**Files:**
- Create: `src/app/journey2/page.tsx`
- Create: `src/app/journey2/JourneyPage.tsx`
- Modify: `src/app/journey/page.tsx` (will be replaced in Task 6)
- Modify: `src/app/journey/JourneyPage.tsx` (will be replaced in Task 6)

- [ ] **Step 1: Create `/journey2` route files**

Copy `src/app/journey/page.tsx` → `src/app/journey2/page.tsx`:

```tsx
import JourneyPage from "./JourneyPage";

export default function Journey2() {
  return <JourneyPage />;
}
```

Copy `src/app/journey/JourneyPage.tsx` → `src/app/journey2/JourneyPage.tsx`:

```tsx
"use client";

import JourneyView from "@/components/JourneyView";
import { useApp } from "@/context/AppContext";

export default function JourneyPage() {
  const { settings, pitchHz, pitchHzRef, playTone, updateSettings } = useApp();

  return (
    <JourneyView
      settings={settings}
      pitchHz={pitchHz}
      pitchHzRef={pitchHzRef}
      onPlayTone={playTone}
      onSettingsUpdate={updateSettings}
    />
  );
}
```

- [ ] **Step 2: Update JourneyView to use new exercise URLs**

In `src/components/JourneyView/JourneyView.tsx`, change the `onSelect` callback:

```tsx
import { journey } from "@/constants/journey";

// Change:
onSelect={(exerciseId) => router.push(`/journey/${exerciseId}`)}
// To:
onSelect={(exerciseId) => router.push(journey.exerciseHref(exerciseId))}
```

- [ ] **Step 3: Verify `/journey2` loads in dev**

Run: `npm run dev` and navigate to `http://localhost:3000/journey2`
Expected: current journey list renders, clicking exercises navigates to `/ch/[ch]/[ex]` (404 for now, that's fine)

- [ ] **Step 4: Commit**

```bash
git add src/app/journey2/ src/components/JourneyView/JourneyView.tsx
git commit -m "feat: move current journey to /journey2, update exercise URLs"
```

---

### Task 4: Create `/ch/[ch]/[ex]` exercise route

**Files:**
- Create: `src/app/ch/[ch]/[ex]/page.tsx`

- [ ] **Step 1: Create the exercise page**

Create `src/app/ch/[ch]/[ex]/page.tsx`:

```tsx
"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { JourneyExercise } from "@/components/JourneyView";
import { useApp } from "@/context/AppContext";
import { journey } from "@/constants/journey";

/**
 * Chapter exercise page — URL-driven: /ch/[ch]/[ex]
 * [ch] = 1-based chapter number
 * [ex] = 1-based exercise index within chapter
 */
export default function ChapterExercisePage() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { settings, pitchHz, pitchHzRef, playTone, playSlide, updateSettings } = useApp();

  // Parse route params
  const ch = typeof params?.ch === "string" ? parseInt(params.ch, 10) : NaN;
  const ex = typeof params?.ex === "string" ? parseInt(params.ex, 10) : NaN;

  const exercise = !isNaN(ch) && !isNaN(ex) ? journey.exerciseByRoute(ch, ex) : null;

  useEffect(() => {
    if (!exercise) router.replace("/journey");
  }, [exercise, router]);

  if (!exercise) return null;

  return (
    <JourneyExercise
      exerciseId={exercise.id}
      settings={settings}
      pitchHz={pitchHz}
      pitchHzRef={pitchHzRef}
      onPlayTone={playTone}
      onPlaySlide={playSlide}
      onSettingsUpdate={updateSettings}
      onBack={() => router.push(`/ch/${ch}`)}
      onNext={(nextId) => router.push(journey.exerciseHref(nextId))}
      onPrev={(prevId) => router.push(journey.exerciseHref(prevId))}
    />
  );
}
```

- [ ] **Step 2: Verify exercise page works in dev**

Run: navigate to `http://localhost:3000/ch/1/1`
Expected: first exercise of chapter 1 renders. Back button goes to `/ch/1` (404 for now). Next navigates to `/ch/1/2`.

- [ ] **Step 3: Commit**

```bash
git add src/app/ch/
git commit -m "feat: add /ch/[ch]/[ex] exercise route"
```

---

### Task 5: Update JourneyExercise sub-nav for chapter context

**Files:**
- Modify: `src/components/JourneyView/components/JourneyExercise.tsx:84,136-137`

- [ ] **Step 1: Make back label and prefetch paths configurable**

In `src/components/JourneyView/components/JourneyExercise.tsx`, add optional props:

```ts
// Add to the props type (after onPrev):
  /** Label for the back button. Default: "← Journey" */
  backLabel?: string;
```

- [ ] **Step 2: Update the sub-nav back button to use the prop**

Replace the hardcoded "← Journey" (line ~137):

```tsx
// Change:
← Journey
// To:
{backLabel ?? "← Journey"}
```

- [ ] **Step 3: Update the prefetch to use `journey.exerciseHref`**

In the `useEffect` that prefetches (line ~84):

```tsx
// Change:
if (nextId !== null) router.prefetch(`/journey/${nextId}`);
// To:
if (nextId !== null) router.prefetch(journey.exerciseHref(nextId));
```

- [ ] **Step 4: Update the `/ch/[ch]/[ex]` page to pass backLabel**

In `src/app/ch/[ch]/[ex]/page.tsx`, add `backLabel` to the JourneyExercise props:

```tsx
<JourneyExercise
  exerciseId={exercise.id}
  backLabel="← Chapter"
  // ... rest of props
/>
```

- [ ] **Step 5: Verify in dev**

Navigate to `/ch/1/3`. Expected: sub-nav shows "← Chapter" instead of "← Journey". Clicking it goes to `/ch/1`.

- [ ] **Step 6: Commit**

```bash
git add src/components/JourneyView/components/JourneyExercise.tsx src/app/ch/
git commit -m "feat: make JourneyExercise back label configurable for chapter nav"
```

---

### Task 6: Create ChapterList component and `/journey` page

**Files:**
- Create: `src/components/ChapterList/index.ts`
- Create: `src/components/ChapterList/ChapterList.tsx`
- Create: `src/components/ChapterList/components/ChapterCard.tsx`
- Create: `src/components/ChapterList/components/StageDots.tsx`
- Create: `src/components/ChapterList/components/ContinueStrip.tsx`
- Modify: `src/app/journey/page.tsx`
- Modify: `src/app/journey/JourneyPage.tsx`

- [ ] **Step 1: Create StageDots component**

Create `src/components/ChapterList/components/StageDots.tsx`:

```tsx
"use client";

import type { StageConfig } from "@/constants/journey";

interface StageDotsProps {
  stages: StageConfig[];
  highestCompleted: number;
}

export function StageDots({ stages, highestCompleted }: StageDotsProps) {
  return (
    <div className="flex gap-[3px] px-4 pb-3">
      {stages.map((stage) => {
        const exercises = stage.exercises;
        const lastId = exercises[exercises.length - 1]?.id ?? 0;
        const firstId = exercises[0]?.id ?? 0;
        const isComplete = highestCompleted >= lastId;
        const isActive = !isComplete && highestCompleted >= firstId - 1;

        return (
          <div
            key={stage.id}
            className="h-[3px] rounded-sm flex-1"
            style={{
              background: isComplete
                ? "#a855f7"
                : isActive
                  ? "rgba(168,133,246,0.4)"
                  : "rgba(255,255,255,0.08)",
            }}
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create ContinueStrip component**

Create `src/components/ChapterList/components/ContinueStrip.tsx`:

```tsx
"use client";

import { Text } from "@/components/ui";
import type { ExerciseConfig, StageConfig } from "@/constants/journey";

interface ContinueStripProps {
  exercise: ExerciseConfig;
  stage: StageConfig;
  onClick: (e: React.MouseEvent) => void;
}

export function ContinueStrip({ exercise, stage, onClick }: ContinueStripProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-4 py-2.5 border-t cursor-pointer transition-colors hover:bg-white/2 text-left"
      style={{
        borderColor: "rgba(255,255,255,0.04)",
        background: "rgba(168,133,246,0.04)",
      }}
    >
      <div
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          background: "#a855f7",
          animation: "pulse-dot 2s ease-in-out infinite",
        }}
      />
      <div className="flex-1 min-w-0">
        <Text variant="body-sm" as="span" className="font-medium" style={{ color: "rgba(255,255,255,0.75)" }}>
          {exercise.title}
        </Text>
        <Text variant="caption" as="div" style={{ color: "rgba(255,255,255,0.3)" }}>
          {stage.title}
        </Text>
      </div>
      <Text variant="body" as="span" style={{ color: "rgba(168,133,246,0.5)" }}>
        ›
      </Text>
    </button>
  );
}
```

- [ ] **Step 3: Add pulse-dot keyframe to globals.css**

In `src/app/globals.css`, add after the existing animations:

```css
@keyframes pulse-dot {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}
```

- [ ] **Step 4: Create ChapterCard component**

Create `src/components/ChapterList/components/ChapterCard.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { Text, Button } from "@/components/ui";
import { toRoman } from "@/lib/format";
import { getExerciseDisplayColors } from "@/components/JourneyView/utils";
import { journey } from "@/constants/journey";
import type { Chapter } from "@/constants/journey";
import { StageDots } from "./StageDots";
import { ContinueStrip } from "./ContinueStrip";

interface ChapterCardProps {
  chapter: Chapter;
  highestCompleted: number;
}

export function ChapterCard({ chapter, highestCompleted }: ChapterCardProps) {
  const router = useRouter();
  const allStages = chapter.warmup
    ? [chapter.warmup, ...chapter.stages]
    : chapter.stages;
  const allExercises = allStages.flatMap((s) => s.exercises);
  const totalExercises = allExercises.length;
  if (totalExercises === 0) return null;

  const firstId = allExercises[0].id;
  const lastId = allExercises[totalExercises - 1].id;
  const completedCount = allExercises.filter((e) => e.id <= highestCompleted).length;

  const isComplete = highestCompleted >= lastId;
  const isStarted = highestCompleted >= firstId;
  const isLocked = firstId > highestCompleted + 1;
  const isInProgress = isStarted && !isComplete;

  // Find next exercise (first uncompleted)
  const nextExercise = allExercises.find((e) => e.id > highestCompleted);
  const nextStage = nextExercise
    ? allStages.find((s) => s.id === nextExercise.stageId)
    : null;
  const nextHref = nextExercise ? journey.exerciseHref(nextExercise.id) : null;

  // Color accent strip — collect colors from all exercises
  // Note: getExerciseDisplayColors currently returns the full palette for every exercise.
  // The gradient will look the same on every chapter until the function is made exercise-aware.
  const colors = allExercises.flatMap((e) => getExerciseDisplayColors(e));
  const uniqueColors = [...new Set(colors)];
  const gradient = uniqueColors.length > 1
    ? `linear-gradient(90deg, ${uniqueColors.join(", ")})`
    : uniqueColors[0] ?? "#a855f7";

  function handleCardClick() {
    if (isLocked) return;
    router.push(`/ch/${chapter.chapter}`);
  }

  function handleContinueClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (nextHref) router.push(nextHref);
  }

  function handleStartRestart(e: React.MouseEvent) {
    e.stopPropagation();
    router.push(`/ch/${chapter.chapter}/1`);
  }

  return (
    <div
      onClick={handleCardClick}
      className="rounded-2xl border overflow-hidden transition-all"
      style={{
        background: isInProgress ? "rgba(168,133,246,0.04)" : "rgba(255,255,255,0.025)",
        borderColor: isInProgress
          ? "rgba(168,133,246,0.25)"
          : "rgba(255,255,255,0.07)",
        opacity: isLocked ? 0.4 : 1,
        cursor: isLocked ? "default" : "pointer",
        pointerEvents: isLocked ? "none" : "auto",
      }}
    >
      {/* Color accent strip */}
      <div className="h-[3px] w-full" style={{ background: gradient, opacity: isLocked ? 0.4 : 1 }} />

      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex justify-between items-start">
          <div>
            <Text variant="label" as="span" style={{ color: "rgba(168,133,246,0.5)" }}>
              Chapter {toRoman(chapter.chapter)}
            </Text>
            <Text variant="heading-sm" as="h2" className="mt-1">
              {chapter.title}
            </Text>
          </div>
          {!isLocked && (
            <Text variant="caption" as="span" color="muted-2" className="pt-0.5">
              {completedCount}/{totalExercises}
            </Text>
          )}
        </div>
        <Text variant="body-sm" color="text-2" className="mt-1">
          {chapter.description}
        </Text>
      </div>

      {/* Stage dots */}
      {allStages.length > 0 && (
        <StageDots stages={allStages} highestCompleted={highestCompleted} />
      )}

      {/* Continue strip — shown when in-progress */}
      {isInProgress && nextExercise && nextStage && (
        <ContinueStrip
          exercise={nextExercise}
          stage={nextStage}
          onClick={handleContinueClick}
        />
      )}

      {/* Action bar */}
      {!isLocked && (
        <div className="flex border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {isInProgress && (
            <Button
              variant="ghost"
              onClick={handleStartRestart}
              className="flex-1 py-2.5 px-3 text-xs font-semibold rounded-none"
              style={{ color: "rgba(255,255,255,0.4)", borderRight: "1px solid rgba(255,255,255,0.05)" }}
            >
              Start over
            </Button>
          )}
          {!isStarted && nextHref && (
            <Button
              variant="ghost"
              onClick={handleStartRestart}
              className="flex-1 py-2.5 px-3 text-xs font-semibold rounded-none"
              style={{ color: "#a78bfa" }}
            >
              Start →
            </Button>
          )}
          {isInProgress && nextHref && (
            <Button
              variant="ghost"
              onClick={handleContinueClick}
              className="flex-1 py-2.5 px-3 text-xs font-semibold rounded-none"
              style={{ color: "#a78bfa" }}
            >
              Continue →
            </Button>
          )}
          {isComplete && (
            <Button
              variant="ghost"
              onClick={handleStartRestart}
              className="flex-1 py-2.5 px-3 text-xs font-semibold rounded-none"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Replay
            </Button>
          )}
        </div>
      )}

      {/* Locked message */}
      {isLocked && (
        <div className="px-4 pb-3">
          <Text variant="caption" color="muted-2">
            Complete Chapter {toRoman(chapter.chapter - 1)} to unlock
          </Text>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create ChapterList component**

Create `src/components/ChapterList/ChapterList.tsx`:

```tsx
"use client";

import { useSearchParams } from "next/navigation";
import { journey } from "@/constants/journey";
import { Text } from "@/components/ui";
import type { Settings } from "@/hooks/useSettings";
import { ChapterCard } from "./components/ChapterCard";

interface ChapterListProps {
  settings: Settings;
}

export function ChapterList({ settings }: ChapterListProps) {
  const searchParams = useSearchParams();
  const unlockAll = searchParams.has("unlock");
  const highestCompleted = unlockAll ? Infinity : settings.journeyStage;

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col gap-4 px-5 py-5 max-w-2xl mx-auto w-full">
        <Text variant="heading" as="h1" className="sm:text-2xl">Journey</Text>
        <div className="flex flex-col gap-2">
          <Text variant="body-sm" color="text-2">
            This is where your journey begins. You&apos;ll be guided through
            learning and practice — from vocal warmups to sustaining each tone
            and exploring techniques like mantras and vowels.
          </Text>
          <Text variant="body-sm" color="text-2">
            When you&apos;ve built confidence, switch to Train for freeform
            practice — any tone, any order.
          </Text>
        </div>

        <div className="flex flex-col gap-3">
          {journey.chapters.map((chapter) => (
            <ChapterCard
              key={chapter.chapter}
              chapter={chapter}
              highestCompleted={highestCompleted}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create index barrel**

Create `src/components/ChapterList/index.ts`:

```ts
export { ChapterList } from "./ChapterList";
```

- [ ] **Step 7: Replace `/journey` page with new ChapterList**

Replace `src/app/journey/JourneyPage.tsx`:

```tsx
"use client";

import { Suspense } from "react";
import { ChapterList } from "@/components/ChapterList";
import { useApp } from "@/context/AppContext";

export default function JourneyPage() {
  const { settings } = useApp();

  return (
    <Suspense>
      <ChapterList settings={settings} />
    </Suspense>
  );
}
```

- [ ] **Step 8: Verify in dev**

Navigate to `http://localhost:3000/journey`
Expected: chapter cards render with color strip, stage dots, continue strip for in-progress chapter. Clicking card body shows 404 for `/ch/1` (created in next task). Continue strip and Start/Continue buttons navigate to `/ch/[ch]/[ex]` which should work.

- [ ] **Step 9: Commit**

```bash
git add src/components/ChapterList/ src/app/journey/JourneyPage.tsx src/app/globals.css
git commit -m "feat: add ChapterList with chapter cards on /journey"
```

---

### Task 7: Create ChapterDetail component and `/ch/[ch]` page

**Files:**
- Create: `src/components/ChapterDetail/index.ts`
- Create: `src/components/ChapterDetail/ChapterDetail.tsx`
- Create: `src/app/ch/[ch]/page.tsx`

- [ ] **Step 1: Create ChapterDetail component**

Create `src/components/ChapterDetail/ChapterDetail.tsx`:

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { journey } from "@/constants/journey";
import { Text, Button } from "@/components/ui";
import { toRoman } from "@/lib/format";
import { ExerciseCard } from "@/components/JourneyView/components/ExerciseCard";
import type { Chapter } from "@/constants/journey";
import type { Settings } from "@/hooks/useSettings";

interface ChapterDetailProps {
  chapter: Chapter;
  settings: Settings;
}

export function ChapterDetail({ chapter, settings }: ChapterDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unlockAll = searchParams.has("unlock");
  const highestCompleted = unlockAll ? Infinity : settings.journeyStage;

  const allStages = chapter.warmup
    ? [chapter.warmup, ...chapter.stages]
    : chapter.stages;
  const allExercises = allStages.flatMap((s) => s.exercises);

  // Find next exercise
  const nextExercise = allExercises.find((e) => e.id > highestCompleted);
  const nextHref = nextExercise ? journey.exerciseHref(nextExercise.id) : null;
  const isStarted = allExercises.some((e) => e.id <= highestCompleted);

  function handleSelect(exerciseId: number) {
    router.push(journey.exerciseHref(exerciseId));
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col gap-4 px-5 py-5 max-w-2xl mx-auto w-full">
        {/* Back link */}
        <Button
          variant="ghost"
          onClick={() => router.push("/journey")}
          className="self-start text-xs text-white/48 hover:text-white/72 -ml-2"
        >
          ← Journey
        </Button>

        {/* Chapter header */}
        <div>
          <Text variant="label" as="span" color="muted-1">
            Chapter {toRoman(chapter.chapter)}
          </Text>
          <Text variant="heading" as="h1" className="mt-1 sm:text-2xl">
            {chapter.title}
          </Text>
          <Text variant="body-sm" color="text-2" className="mt-1">
            {chapter.description}
          </Text>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {nextHref && (
            <Button variant="primary" onClick={() => router.push(nextHref)}>
              {isStarted ? `Continue — ${nextExercise!.title}` : "Start"}
            </Button>
          )}
          {isStarted && (
            <Button variant="ghost" onClick={() => router.push(`/ch/${chapter.chapter}/1`)}>
              Start from beginning
            </Button>
          )}
        </div>

        {/* Exercise list by stage */}
        {allStages.map((stage) => (
          <div key={stage.id} className="flex flex-col gap-1.5">
            <Text variant="caption" as="span" color="muted-2" className="pl-1 pt-1">
              {stage.title}
            </Text>
            {stage.exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                highestCompleted={highestCompleted}
                onSelect={handleSelect}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create index barrel**

Create `src/components/ChapterDetail/index.ts`:

```ts
export { ChapterDetail } from "./ChapterDetail";
```

- [ ] **Step 3: Create the `/ch/[ch]` page**

Create `src/app/ch/[ch]/page.tsx`:

```tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { ChapterDetail } from "@/components/ChapterDetail";
import { useApp } from "@/context/AppContext";
import { journey } from "@/constants/journey";

export default function ChapterPage() {
  const params = useParams();
  const router = useRouter();
  const { settings } = useApp();

  const ch = typeof params?.ch === "string" ? parseInt(params.ch, 10) : NaN;
  const chapter = !isNaN(ch) ? journey.chapters.find((c) => c.chapter === ch) : undefined;

  useEffect(() => {
    if (!chapter) router.replace("/journey");
  }, [chapter, router]);

  if (!chapter) return null;

  return (
    <Suspense>
      <ChapterDetail chapter={chapter} settings={settings} />
    </Suspense>
  );
}
```

- [ ] **Step 4: Verify in dev**

Navigate to `http://localhost:3000/ch/1`
Expected: chapter detail page renders with back link, header, action buttons, exercise list by stage. Clicking an exercise navigates to `/ch/1/[ex]`.

- [ ] **Step 5: Commit**

```bash
git add src/components/ChapterDetail/ src/app/ch/
git commit -m "feat: add ChapterDetail and /ch/[ch] route"
```

---

### Task 8: Remove old `/journey/[id]` route

**Files:**
- Delete: `src/app/journey/[id]/page.tsx`

- [ ] **Step 1: Delete old exercise route**

```bash
rm -rf src/app/journey/\[id\]
```

- [ ] **Step 2: Verify no broken imports**

Run: `npm run build 2>&1 | tail -20`
Expected: build succeeds (no code imports from the deleted route)

- [ ] **Step 3: Verify full flow end-to-end**

1. `/journey` — chapter cards render, continue strip works
2. Click chapter card → `/ch/1` — exercise list renders
3. Click exercise → `/ch/1/3` — exercise renders with "← Chapter" back button
4. Complete exercise → navigates to `/ch/1/4`
5. Back → `/ch/1`
6. `/journey2` — old journey renders, exercise links go to `/ch/[ch]/[ex]`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: remove old /journey/[id] route, all exercises served via /ch/[ch]/[ex]"
```
