# Onboarding Exercise — Design Spec

## Summary

A new `"onboarding"` exercise type inserted as the second exercise in Chapter 1, Stage 1 (Wake Up). It teaches users what the exercise UI controls mean using a spotlight/callout pattern over minimal static mockups.

## Position in Journey

```
Chapter 1 → Stage 1 (Wake Up) → Exercise 2 (after vocal-placement, before understanding-notes)
```

## User Experience

The screen shows a minimal static mockup of an exercise. A spotlight circle highlights one UI element at a time, with an explanation bubble next to it and a "Next" button inside the bubble. The mockup itself transitions between exercise types to reinforce variety.

### Step Sequence

| Step | Spotlight Target | Mockup | Bubble Text | Button |
|------|-----------------|--------|-------------|--------|
| 1 | Info (i) button | Hill | "Tap this anytime to re-read the exercise instructions" | Next |
| 2 | Reps & Progress | Hill | "This shows how many reps are left and your overall progress" | Next |
| 3 | Play Tone | Hill | "Some exercises play a reference tone for you to match. Tap this to hear it again" | Next |
| 4 | Start button | Hill | "When you're ready, tap Start to begin the exercise" | Next |
| 5 | None (full view) | Farinelli | "There's a variety of exercises. Each one tells you what to do." | Next |
| 6 | Next/Skip buttons | Farinelli | "Tap Next to move to the next exercise, or Skip to come back later" | Finish |

"Finish" on step 6 completes the exercise and triggers navigation to the next exercise via the standard `onComplete` callback.

### Mockups

Two minimal static mockups, not full exercise recreations — just enough visual shape to suggest the exercise type:

- **Hill mockup:** A simple hill curve, a ball on it, rep dots, Play Tone button, Start button overlay, Info (i) button. All static, no animation, no mic.
- **Farinelli mockup:** A simple breathing circle or count display, Next/Skip buttons at bottom. No animation.

Both use the existing design language (colors, typography, spacing) but are purpose-built static elements — not reusing actual exercise components.

### Spotlight Mechanic

- All spotlight targets are **mockup elements** rendered inside the component — not real shell elements. This keeps the component self-contained with no DOM coordination needed.
- A semi-transparent dark overlay covers the screen
- A circular/rounded cutout reveals the spotlighted UI element
- An explanation bubble (tooltip-style) appears adjacent to the cutout with text and a Next/Finish button
- Step 5 (summary): no spotlight target — the overlay disappears, the full Farinelli mockup is visible behind the bubble
- Transition between steps: simple fade or crossfade
- Mockup swap (Hill → Farinelli) happens between steps 4 and 5

## Technical Approach

### New Exercise Type

Add `"onboarding"` to `ExerciseTypeId` in `types.ts`.

**Config type:**

```typescript
export interface OnboardingConfig extends BaseExerciseConfig {
  exerciseTypeId: "onboarding";
}
```

Minimal config — all step content is hardcoded in the component since it's a one-off teaching screen. No configurable fields beyond the base.

### Component

`src/components/Exercise/OnboardingExercise.tsx` — single file, self-contained.

**Internal state:** `step` index (0–5).

**Structure:**
```
<div className="relative w-full h-full">
  {/* Static mockup layer */}
  {step <= 3 ? <HillMockup /> : <FarinelliMockup />}

  {/* Overlay + spotlight cutout */}
  <SpotlightOverlay target={STEPS[step].target} />

  {/* Explanation bubble */}
  <Bubble
    text={STEPS[step].text}
    buttonLabel={step === 5 ? "Finish" : "Next"}
    onAction={step === 5 ? onComplete : nextStep}
  />
</div>
```

`HillMockup` and `FarinelliMockup` are inline sub-components (not extracted to separate files) — they render minimal static SVG/HTML that suggests each exercise type.

The spotlight overlay uses a CSS mask or SVG mask to create the cutout effect.

### Wiring

1. Add `"onboarding"` to `ExerciseTypeId` union in `types.ts`
2. Add `OnboardingConfig` type and include it in `ExerciseConfig` union (derives `ExerciseConfigInput` automatically)
3. Add case in `BaseExercise.tsx` switch — and update the `resolved` guard to include `"onboarding"` in the early-return list (no note resolution needed)
4. Add exercise entry in `chapter1.ts` at position 2 (after vocal-placement)

### Revisit Behavior

On revisit, the walkthrough replays from step 1. It's short (~15 seconds) and serves as a quick refresher.

### Journey Config Entry

```typescript
// in chapter1.ts, after the vocal-placement exercise:
{
  exerciseTypeId: "onboarding",
  slug: "exercise-walkthrough",
  title: "Exercise walkthrough",
  cardSubtitle: "Learn how exercises work — controls, progress, and what to expect",
},
```

### What This Does NOT Include

- No mic access or audio playback
- No intro modal (the exercise itself is the introduction)
- No scoring or reps
- No voice guidance
- No animation in mockups (purely static)
