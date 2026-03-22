# Learn Voice Exercise Type — Design Spec

## Problem

Learn exercises and intro modals present dense paragraphs of text that users skim past. The content reads like a textbook. We want voice narration that feels like a guide talking to you, with text accumulating on screen line by line as each sentence is spoken.

## New Exercise Type: `learn-voice-driven`

A voice-narrated educational exercise where short, story-like sentences are spoken aloud and appear on screen progressively. Previous lines stay visible — by the end, the full text is on screen as a readable summary.

## Config

```typescript
interface LearnVoiceConfig extends BaseExerciseConfig {
  exerciseTypeId: "learn-voice-driven";
  /** Base URL for voice segments on Vercel Blob (e.g. "learn/vocal-placement"). */
  voiceBaseUrl: string;
  /** Ordered segments — each becomes one audio file with its own timestamps. */
  segments: LearnVoiceSegment[];
}

interface LearnVoiceSegment {
  /** Audio file name (e.g. "intro", "body", "closing"). */
  name: string;
  /** Full text for this segment — shown on screen as words accumulate. */
  text: string;
}
```

### Content Style

Text is written for voice — short, conversational, story-like:

- Direct address ("Put your hand on your chest")
- Sensory cues ("feel that?", "notice how")
- Short sentences, natural pauses
- Story arc within each exercise (setup → experience → insight)
- ~3-5 sentences per segment, ~2-4 segments per exercise

**Example** (vocal placement):
```
Segment 1 "intro":
  "Put your hand on your chest. Hum a low note. Feel that vibration?
   That's your voice, living in your body."

Segment 2 "explore":
  "Now hum a little higher. Notice how the buzz moves — up from your
   chest, into your throat, maybe into your face. Every pitch has a home."

Segment 3 "closing":
  "That awareness — knowing where sound lives — is vocal placement.
   You already have it. We're just going to sharpen it."
```

## Voice Generator

New `LearnVoiceConfig` class in `exercise-type-voice-config.ts`:

- Reads `learn-voice-driven` exercises from journey config
- Each segment → one TTS call (instruction voice / Australian baritone)
- Generates: `{name}.mp3` + `{name}.timestamps.json`
- Organized under `learn/{slug}/` in Vercel Blob

Since learn-voice-driven content is per-exercise (not per-type like farinelli), the generator takes a slug parameter to generate segments for a specific exercise.

## Component: `LearnVoiceExercise`

### States
1. **ready** — "Start" button (or auto-play). Preload runs in background.
2. **playing** — Voice narration with progressive text display
3. **complete** — All text visible, "Next" button active

### Text Display Behavior
- Each segment's text appears **line by line** (sentence by sentence)
- As a word is spoken, it appears on the current line
- When a sentence ends, it stays on screen and the next sentence starts below
- Previous segments' text remains visible (scrollable if needed)
- Smooth fade-in animation on each new word/line

### Layout
- Centered text area, left-aligned text
- Current word slightly brighter/highlighted
- Previous lines at normal opacity
- Auto-scroll to keep current line visible

### Audio
- Same blob-fetch + object URL pattern as farinelli voice-driven
- Segments play in sequence with ~1.5s pause between
- Uses word-level timestamps from STT for progressive display

## Chapter 1 Migration

- Comment out existing `learn` exercise configs in chapter1.ts
- Replace with `learn-voice-driven` entries using rewritten, story-like content
- Keep the same slugs so progress isn't lost

## Files to Create/Modify

1. `src/constants/journey/types.ts` — Add `LearnVoiceConfig`, `LearnVoiceSegment`, update unions
2. `src/constants/journey/exercise-generator.ts` — Add `learnVoice()` method
3. `src/components/Exercise/LearnVoiceExercise.tsx` — New component
4. `src/components/Exercise/BaseExercise.tsx` — Wire up new type
5. `scripts/voice-instruction-generator/exercise-type-voice-config.ts` — Add `LearnVoiceConfig` class
6. `src/constants/journey/chapter1.ts` — Comment out old learn, add learn-voice-driven
