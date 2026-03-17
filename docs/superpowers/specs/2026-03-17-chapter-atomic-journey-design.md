# Chapter as Atomic Unit — Journey Redesign

## Summary

Rethink the journey page so that **chapters** are the atomic unit. The `/journey` page shows one card per chapter. Users can start an exercise directly from the card or navigate to a chapter detail page. The current journey implementation is preserved at `/journey2`.

## Routes

| Route | Component | Purpose |
|---|---|---|
| `/journey` | `ChapterList` | New chapter-card list |
| `/journey2` | `Journey2View` | Current journey preserved as-is |
| `/ch/[ch]` | `ChapterDetail` | Exercise list scoped to one chapter |
| `/ch/[ch]/[ex]` | `ChapterExercise` | Exercise page, back goes to chapter |

`[ch]` = chapter number (1-based). `[ex]` = exercise index within the chapter (1-based, sequential across all stages). The component resolves `[ex]` to a global exercise ID internally for progress tracking. Stage grouping is visual only (shown in sub-nav and chapter detail page), not encoded in the URL.

## Chapter Card (`ChapterCard`)

Rendered on `/journey`, one per chapter.

### Anatomy

1. **Color accent strip** — 3px bar at top. Uses `getExerciseDisplayColors` from existing utils to collect colors across all exercises in the chapter, then renders as a horizontal gradient. Exercises without target notes are skipped; if no pitched exercises exist, falls back to `NOTE_PALETTE` default.
2. **Header row** — Roman numeral label (e.g. "CHAPTER I") + title on left, progress count (e.g. "5/13") on right
3. **Description** — One-liner about the chapter content. Requires adding a `description` field to `ChapterInput`/`Chapter` types in `src/constants/journey/types.ts`.
4. **Stage dots** — One dot per stage (including warmup if present):
   - Complete: purple filled (`#a855f7`)
   - Active (in-progress): purple faded (`rgba(168,133,246,0.4)`)
   - Upcoming: `rgba(255,255,255,0.08)`
5. **Continue strip** — Shown when chapter is in-progress:
   - Pulsing purple dot (6px, animated)
   - Next exercise name (e.g. "Hold Your First Note")
   - Stage context (e.g. "Stage 2: First Sounds")
   - Arrow chevron on right
   - Tapping navigates directly to `/ch/[ch]/[ex]` for that exercise (where `[id]` is the **global exercise ID**)
6. **Restart button** — Secondary action, navigation-only (does NOT reset `journeyStage`). Navigates to `/ch/[ch]/1>` so the user replays from the beginning while keeping their progress intact.

### Interactions

- **Tap card body** → navigates to `/ch/[ch]`
- **Tap continue strip** → navigates to `/ch/[ch]/[ex]` (next exercise)
- **Tap restart** → navigates to `/ch/[ch]/1>` (first exercise in chapter)

### States

- **Locked**: opacity 0.4, no continue strip, no restart, no pointer events. Shown when previous chapter is incomplete.
- **In-progress**: active border (`rgba(168,133,246,0.25)`), active background, continue strip visible.
- **Complete**: badge or checkmark indicator, no continue strip, card still tappable to review.
- **Not started** (unlocked but 0 progress): no continue strip, shows "Start" action instead of "Continue". Tapping "Start" navigates to `/ch/[ch]/1>`.

## Chapter Detail Page (`/ch/[ch]`)

### Layout

1. **Back link** — "← Journey" navigates to `/journey`
2. **Chapter header** — Roman numeral + title + description
3. **Action buttons** — "Continue" (primary, names next exercise) + "Start from beginning" (ghost)
4. **Exercise list by stage** — Identical to current JourneyList rendering but scoped to one chapter:
   - Stage title label
   - `ExerciseCard` components (color strip, title, cue, checkmark/lock/chevron)
   - Clicking an exercise navigates to `/ch/[ch]/[ex]`

## Exercise Page (`/ch/[ch]/[ex]`)

### Behavior

- Reuses existing `JourneyExercise` component (info modals, exercise dispatch, completion flow)
- **Route param**: `[ex]` is a **1-based exercise index** within the chapter (sequential across all stages). The component resolves it to a global exercise ID internally for progress tracking and exercise config lookup.
- **Sub-nav adaptation**: `JourneyExercise` currently hardcodes "← Journey" back label and prefetches `/journey/${nextId}`. `ChapterExercise` wraps it and makes these configurable: back label becomes "← Chapter", back target becomes `/ch/[ch]`, prefetch targets become `/ch/[ch]/${nextEx}`.
- **Navigation back**: always goes to `/ch/[ch]` (chapter is the home for every exercise)
- **Completion**: advances to next exercise within the chapter. If last exercise in chapter and it has a `completionModal` config → show it with confetti, then back to `/ch/[ch]`. If no `completionModal` on the last exercise, navigate back to `/ch/[ch]` directly.
- **Progress tracking**: same `settings.journeyStage` mechanism — completing an exercise updates highest completed ID

## Preserving Current Journey

- Move current `/journey` page to `/journey2`
- Rename `JourneyView` → `Journey2View` (or just move the page file and update imports)
- **Update exercise links**: `/journey2` exercise cards and `JourneyExercise` navigation must use the new `/ch/[ch]/[ex]` URL scheme instead of the old `/journey/[id]`. This means the `onSelect` callback, next/prev navigation, and prefetch targets all resolve to `/ch/[ch]/[ex]` (computing chapter number and 1-based exercise index from the global exercise ID). The old `/journey/[id]` route is removed.

## Component Structure

```
src/components/
  ChapterList/
    index.ts
    ChapterList.tsx        # Maps journey.chapters → ChapterCard
    components/
      ChapterCard.tsx      # The rich card (accent, dots, continue strip)
      StageDots.tsx        # Stage progress dots
      ContinueStrip.tsx    # Pulsing dot + exercise name + arrow
  ChapterDetail/
    index.ts
    ChapterDetail.tsx      # Header + action buttons + exercise list
  ChapterExercise/
    index.ts
    ChapterExercise.tsx    # Wraps JourneyExercise with chapter-aware nav

src/app/
  journey/page.tsx         # New: renders ChapterList
  journey2/page.tsx        # Old journey preserved
  ch/[ch]/page.tsx         # Renders ChapterDetail
  ch/[ch]/[ex]/page.tsx    # Renders ChapterExercise
```

## Data Flow

- `journey.chapters` from config provides all chapter/stage/exercise data
- `settings.journeyStage` (highest completed exercise ID) drives:
  - Which chapters are locked/unlocked
  - Which exercises are complete/current/locked within a chapter
  - What the "next exercise" is for the continue strip
- No new state or data structures needed — existing config + settings are sufficient
- The `?unlock` search param is preserved on the new `/journey` and `/ch/[ch]` pages for dev/testing (bypasses chapter locking and exercise locking)

## Required Type Changes

- Add `description: string` to `ChapterInput` and `Chapter` in `src/constants/journey/types.ts`
- Add description strings to each chapter config (`chapter1.ts`, `chapter2.ts`, etc.)
- Make `JourneyExercise` sub-nav configurable: add optional `backLabel`, `backHref`, and `exerciseHrefPrefix` props (or have `ChapterExercise` render its own sub-nav)
- Add a helper to `Journey` class (or utils) to resolve global exercise ID → `{ ch, ex }` (chapter number + 1-based index) and vice versa, since both old and new views need this mapping
- Remove old `/journey/[id]` route — all exercise rendering goes through `/ch/[ch]/[ex]`

## Visual Reference

Chapter card follows Option B from the previous mockup session (file: `.superpowers/brainstorm/mockups/journey-chapter-cards.html`):
- Color accent strip at top
- Stage progress dots
- Continue preview strip with pulsing dot
- No tags/pills
- Plus a restart button (added per this session)
