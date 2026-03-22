# Voice Instruction Generator — Design Spec

## Overview

A CLI tool that generates voice guidance audio segments for exercises using ElevenLabs TTS, then uploads the results to Vercel Blob. The app consumes audio segments via URLs derived from a known base path.

Starting with farinelli breathing exercises. Tips are out of scope for now.

## Key Constraint: Short Segments

ElevenLabs becomes unstable with many `<break>` tags in a single generation (audio speeds up, introduces artifacts). Audio is generated as **short, separate segments** (one per instruction cue) rather than one long file. The app plays segments in sequence with code-controlled pauses between them.

## Goals

- Generate short SSML segments per exercise type (e.g. "Inhale. 1, 2, 3, 4")
- Convert each segment to speech via ElevenLabs with timestamps
- Upload segments to Vercel Blob
- App derives segment URLs from a base path + exercise params (e.g. `maxCount`)

## Non-Goals (for now)

- Voice tips generation (future — separate audio source, per exercise)
- Chapter+exercise-specific voice content (future — for unique intros, etc.)
- In-app TTS or streaming

## Architecture

Three distinct concerns:

1. **SSMLGenerator + ExerciseTypeVoiceConfig** (`scripts/voice-instruction-generator/`) — defines what segments to generate per exercise type, generates SSML, calls ElevenLabs, saves files. CLI tooling, never bundled.
2. **VoiceInstructionConfig** (`src/`) — holds Vercel Blob base URL, consumed by the app at runtime. App derives segment names from exercise params.
3. **Voice settings** (`scripts/voice-instruction-generator/settings.ts`) — ElevenLabs voice profiles and model config.

### File Structure

```
scripts/voice-instruction-generator/
  index.ts                     # CLI entry point (generate-type + upload subcommands)
  ssml-generator.ts            # SSML generation per segment
  exercise-type-voice-config.ts # Defines segments per exercise type
  settings.ts                  # Voice profiles (named voices with params)
  output/                      # .gitignored — local generated files
    exercise-types/
      breathwork-farinelli/
        countdown.mp3
        countdown.timestamps.json
        inhale-4.mp3
        inhale-4.timestamps.json
        hold-4.mp3
        hold-4.timestamps.json
        exhale-8.mp3
        exhale-8.timestamps.json
        ...

src/
  constants/voice-instructions.ts  # Base URLs per exercise type (app-side)
```

### Relationship to ExerciseGenerator

SSMLGenerator is an offline content-generation tool, decoupled from ExerciseGenerator.

- **SSMLGenerator imports exercise config**: it scans all exercises of a type to determine the full range of segments needed (e.g. all farinelli `maxCount` values → generate inhale/hold 4-11).
- **Not imported by app**: SSML generation stays in `scripts/`. The app only sees Vercel Blob URLs.

## Segment-Based Generation

### ExerciseTypeVoiceConfig

Defines what segments to generate for an exercise type:

```ts
// scripts/voice-instruction-generator/exercise-type-voice-config.ts

interface VoiceSegment {
  name: string;   // e.g. "inhale-4", "countdown"
  ssml: string;   // short SSML to send to ElevenLabs
}

interface ExerciseTypeVoiceConfig {
  exerciseTypeId: string;
  segments: () => VoiceSegment[];
}
```

### Farinelli Segments

For farinelli, the generator scans all exercises' `maxCount` values from the journey config to determine the range (e.g. 4-11). It generates:

- `countdown.mp3` — "Three. Two. One."
- `inhale-{N}.mp3` — "Inhale. 1, 2, ... N" (for each N in range)
- `hold-{N}.mp3` — "Hold. 1, 2, ... N" (for each N in range)
- `exhale-8.mp3` — "Exhale. 1, 2, ... 8" (always 8)

Each segment is a short SSML with minimal break tags (≤8 per segment).

### App-Side: Deriving Segments

The app doesn't need an explicit list of segment URLs. Given the base URL and the exercise's `maxCount`, it constructs the playlist:

```ts
// For maxCount: 7, cycles 4→7:
const segments = [
  "countdown",
  "inhale-4", "hold-4", "exhale-8",  // cycle 4
  "inhale-5", "hold-5", "exhale-8",  // cycle 5
  "inhale-6", "hold-6", "exhale-8",  // cycle 6
  "inhale-7", "hold-7", "exhale-8",  // cycle 7
];
// URLs: `${baseUrl}/${segment}.mp3`
```

Pauses between segments are controlled in app code — not baked into audio.

## CLI Interface

```bash
# Generate all segments for an exercise type
npx tsx -r tsconfig-paths/register scripts/voice-instruction-generator generate-type breathwork-farinelli

# Upload all segments for an exercise type
npx tsx -r tsconfig-paths/register scripts/voice-instruction-generator upload-type breathwork-farinelli

# Test with minimal content
npx tsx -r tsconfig-paths/register scripts/voice-instruction-generator test
```

### `generate-type` subcommand

1. Looks up `ExerciseTypeVoiceConfig` for the given type
2. For each segment, checks if `{name}.mp3` already exists locally
   - **Exists**: skips with a log message ("Skipping {name} — already exists")
   - **Missing**: generates via ElevenLabs
   - **`--force` flag**: regenerates all segments, overwriting existing files
   - This means adding new exercises with higher `maxCount` only generates the new segments
3. Calls ElevenLabs TTS + speech-to-text for timestamps per segment
4. Saves `{name}.mp3` and `{name}.timestamps.json` to `output/exercise-types/{typeId}/`

### `upload-type` subcommand

1. Reads all files from `output/exercise-types/{typeId}/`
2. Uploads to Vercel Blob under `voice/exercise-types/{typeId}/`
3. Prints the base URL

## Voice Settings

`scripts/voice-instruction-generator/settings.ts`:

```ts
interface VoiceProfile {
  name: string;
  voiceId: string;
  speed?: number;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  speakerBoost?: boolean;
}

const VOICE_RILEY: VoiceProfile = { ... };
const VOICE_AUSTRALIAN_BARITONE: VoiceProfile = { ... };

export const voiceSettings = {
  instructionVoice: VOICE_AUSTRALIAN_BARITONE,
  tipsVoice: VOICE_RILEY,
  modelId: "eleven_multilingual_v2",
  languageCode: "en",
};
```

## App-Side Config

```ts
// src/constants/voice-instructions.ts
export const VOICE_INSTRUCTIONS = {
  "breathwork-farinelli": {
    baseUrl: "https://...",  // Vercel Blob base URL
  },
};
```

The farinelli exercise component uses `baseUrl` + segment names derived from `maxCount` to preload and play audio.

## Environment Variables

Read from `.env.local`:

- `ELEVENLABS_API_KEY` — ElevenLabs API authentication
- `ATTUNR_BLOB_READ_WRITE_TOKEN` — Vercel Blob upload authentication

## ElevenLabs API

Two API calls per segment:

1. **TTS** (`/v1/text-to-speech/{voice_id}`) — generates audio with `enable_ssml_parsing: true`, `language_code: "en"`
2. **Speech-to-text** (`/v1/speech-to-text`) — forced alignment on the generated audio to get word-level timestamps

### Idempotency

Re-running `generate-type` overwrites existing local files. Re-running `upload-type` overwrites Blob at the same paths. Both operations are safe to repeat.

## Dependencies

Dev dependencies (already installed):

- `@vercel/blob` — Blob storage upload
- `dotenv` — load `.env.local`
- `tsconfig-paths` — resolve `@/` aliases when running scripts

## Future Extensions

- **Voice tips**: per-exercise tip audio with separate voice, played by a different audio source
- **Chapter+exercise content**: unique intros or guidance per specific exercise instance
- **Bulk generation**: generate all exercise types at once
- **Skip existing**: only generate segments that don't exist locally yet
