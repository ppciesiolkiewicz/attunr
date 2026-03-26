// ── Exercise config types ────────────────────────────────────────────────────
// These types drive canvas selection, progress tracking, detection tolerance,
// and tone playback. See specs/exercise-config-flow.md for the full mapping.
// If you change these types, update the spec to match.

/**
 * Determines which canvas, progress model, and UI the exercise renders.
 */
export type ExerciseTypeId =
  | "learn"                       // text + video placeholder, no exercise
  | "learn-notes-1"              // interactive notes introduction with range canvas
  | "learn-voice-driven"          // voice-narrated learn — text accumulates as words are spoken
  | "pitch-detection"             // hold tone(s) — single note or sequence
  | "pitch-detection-slide"       // glide between two pitches
  | "pitch-detection-hill"        // roll ball uphill or downhill by pitch direction
  | "breathwork-farinelli"        // Farinelli breathing cycles, no pitch detection
  | "farinelli-voice-driven"      // Voice-guided Farinelli — audio segments drive the UI
  | "tone-follow"                 // play tone and follow along (no mic detection)
  | "melody"                      // sing along to scrolling melody with scoring
  | "volume-detection"            // accumulate sound for targetSeconds to complete
  | "time-based"                   // timed cue sequence — no mic
  | "rhythm"                      // tap along to a rhythm pattern
  | "walkthrough";                // UI walkthrough — spotlight tutorial, no exercise

/** 1-indexed chromatic degree from user's lowest note (1 = lowest). Negative values count from top (-1 = highest). */
export type ChromaticDegree = number;

/** Discriminant for NoteTarget union. */
export enum BandTargetKind {
  Index = "index",
  Range = "range",
}

// ── Note targeting ─────────────────────────────────────────────────────────────

/**
 * Describes which note(s) in a scale an exercise targets.
 *
 * - index: Position in the scale's note pool.
 *   When resolved via resolveFromRoot() (melody events): root-relative.
 *     i=1 is root, i=2 is one above root, i=0 is one below root, i=-1 is two below root.
 *   When resolved via resolve() (all other exercises): full-array indexed.
 *     Positive i: 1-indexed from start. Negative i: from end (-1 = last note).
 * - range: Inclusive range using full-array indexing (1-indexed from start, negative from end).
 *   Used for loose detection exercises.
 *   - accept: "below" = any tone at or below the range; "above" = any tone at or above
 */
export type NoteTarget =
  | { kind: BandTargetKind.Index; i: number }
  | {
      kind: BandTargetKind.Range;
      from: number;
      to: number;
      accept?: "within" | "below" | "above";
    };

/** A single tone the user must hold in-tune for `seconds`. */
export type SustainNoteConfig = { target: NoteTarget; seconds: number };

/** Start and end targets for a pitch glide exercise. */
export type SlideConfig = { from: NoteTarget; to: NoteTarget };

// ── Modal config ─────────────────────────────────────────────────────────────

/** A single content element rendered in a modal or exercise body. */
export type ContentElement =
  | WarningElement
  | ParagraphElement
  | VideoElement
  | HeadphonesNoticeElement
  | TipListElement
  | SeparatorElement;

export interface WarningElement {
  type: "warning";
  text: string;
}

export interface ParagraphElement {
  type: "paragraph";
  text: string;
  /** "primary" = bright (default), "secondary" = dimmer */
  variant?: "primary" | "secondary";
}

export interface VideoElement {
  type: "video";
  url?: string;
  text?: string;
}

export interface HeadphonesNoticeElement {
  type: "headphones-notice";
}

export interface TipListElement {
  type: "tip-list";
  title: string;
  tips: string[];
}

export interface SeparatorElement {
  type: "separator";
}

/** Config for a modal shown before or after an exercise. */
export interface ModalConfig {
  title: string;
  subtitle: string;
  elements: ContentElement[];
  /** Action button label. Default: "Begin exercise →" / "Continue →" */
  actionLabel?: string;
  /** Fire confetti on open? */
  confetti?: boolean;
}

/** Voice guidance — generated offline, hosted on Vercel Blob. */
export interface VoiceConfig {
  instructionUrl: string;
  instructionTimestampsUrl: string;
  /** SSML text for TTS generation. Used by the voice-instruction-generator only — not consumed at runtime. */
  spokenText: string;
  /** Display text shown on screen as words accumulate. Falls back to exercise instruction if omitted. */
  displayText?: string;
}

// ── Layer 1: Base ─────────────────────────────────────────────────────────────

/** Fields shared by all exercise types. */
export interface BaseExerciseConfig {
  /** Unique exercise ID — assigned automatically by index.ts from array position. */
  id: number;
  exerciseTypeId: ExerciseTypeId;
  /** URL-safe slug for this exercise (e.g. "gentle-hum"). */
  slug: string;
  /** 1-indexed chapter number — assigned automatically by index.ts. */
  chapter: number;
  /** Chapter slug (e.g. "introduction") — assigned automatically by index.ts. */
  chapterSlug: string;
  /** Stage ID slug (e.g. "wake-up") — assigned automatically by index.ts. */
  stageId: string;
  title: string;
  /** Secondary text shown in exercise header (e.g. "Hum · 5 seconds"). */
  headerSubtitle?: string;
  /** Engagement hook shown on the journey list card (falls back to headerSubtitle). */
  cardSubtitle?: string;
  /** Shown before exercise starts. */
  introModal?: ModalConfig;
  /** When true, introModal only opens via (i) icon — not automatically on first visit. Default: false (auto-opens). */
  introModalInfoOnly?: boolean;
  /** Shown after exercise completes (e.g. part-complete summary). */
  completionModal?: ModalConfig;
  /** Show the "enable practice reminders" toast when this exercise's info modal is displayed. */
  showEnableNotificationsPrompt?: boolean;
  /** Voice guidance audio — generated by scripts/voice-instruction-generator.ts. */
  voice?: VoiceConfig;
}

// ── Layer 2: Specific exercise types ─────────────────────────────────────────

export interface LearnConfig extends BaseExerciseConfig {
  exerciseTypeId: "learn";
  /** Body content rendered as ContentElement[]. */
  elements: ContentElement[];
}

/** A segment of voice-narrated learn content — one audio file + text. */
export interface LearnVoiceSegment {
  /** Audio file name (e.g. "intro", "explore", "closing"). */
  name: string;
  /** Full text for this segment — shown on screen as words accumulate. */
  text: string;
  /** SSML text for TTS generation. May include <break> tags. Falls back to text if omitted — no audio generated. */
  spokenText?: string;
}

export interface LearnVoiceDrivenConfig extends BaseExerciseConfig {
  exerciseTypeId: "learn-voice-driven";
  /** Base URL for voice segments on Vercel Blob (e.g. "learn/vocal-placement"). */
  voiceBaseUrl: string;
  /** Ordered segments — each becomes one audio file with timestamps. */
  segments: LearnVoiceSegment[];
}

export interface LearnNotesConfig extends BaseExerciseConfig {
  exerciseTypeId: "learn-notes-1";
  /** Scale to display on the range canvas. Defaults to major scale from root. */
  scale?: BaseScale;
}

/** Shape of the reference tone played before a pitch-detection exercise. */
export type ToneShape =
  | { kind: "sustain" }
  | { kind: "wobble" }
  | { kind: "owl-hoot" };

export interface PitchDetectionConfig extends BaseExerciseConfig {
  exerciseTypeId: "pitch-detection";
  scale: BaseScale;
  /** Shape of the reference tone. Defaults to sustain (flat sine). */
  toneShape?: ToneShape;
  /** One note = single-tone hold; multiple = sing in sequence. */
  notes: SustainNoteConfig[];
  instruction: string;
}

export interface PitchDetectionSlideConfig extends BaseExerciseConfig {
  exerciseTypeId: "pitch-detection-slide";
  scale: BaseScale;
  /** Typically one slide config (from → to). */
  notes: SlideConfig[];
  displayNotes?: DisplayScale[];
  instruction: string;
}

export interface PitchDetectionHillConfig extends BaseExerciseConfig {
  exerciseTypeId: "pitch-detection-hill";
  scale: BaseScale;
  toneShape?: ToneShape;
  notes: SustainNoteConfig[];
  /** Ball rolls uphill, downhill, or balances on a symmetric hill. */
  direction: "up" | "down" | "between";
  /** Extra notes to display on the canvas (visual context only, not detection targets). */
  displayNotes?: DisplayScale[];
  instruction: string;
}

export interface FarinelliBreathworkConfig extends BaseExerciseConfig {
  exerciseTypeId: "breathwork-farinelli";
  /** Number of breathing cycles to complete (typically 7). */
  maxCount: number;
  instruction: string;
}

export interface FarinelliVoiceDrivenConfig extends BaseExerciseConfig {
  exerciseTypeId: "farinelli-voice-driven";
  /** Number of breathing cycles to complete — determines which audio segments to load. */
  maxCount: number;
  /** Base URL for voice segments on Vercel Blob. */
  voiceBaseUrl: string;
  instruction: string;
}

/** Shared scale definition — specifies which note pool to build. */
export interface BaseScale {
  /** Tonal.js scale name or custom identifier (e.g. "even-7-from-major"). */
  type: string;
  /** 1-indexed chromatic degree from user's lowest note. */
  root: ChromaticDegree;
  /** Reference point for root positioning. Default: "start" (from lowest note). */
  startPoint?: "start" | "end" | "center";
}

/** Shape of the tone played in a tone-follow exercise. */
export type ToneFollowShape =
  | { kind: "slide"; from: NoteTarget; to: NoteTarget }
  | { kind: "sustain"; target: NoteTarget; seconds: number };

export interface ToneFollowConfig extends BaseExerciseConfig {
  exerciseTypeId: "tone-follow";
  scale: BaseScale;
  /** Describes the tone to play (slide glide or sustained note). */
  toneShape: ToneFollowShape;
  /** Reference notes to highlight on the canvas (e.g. major scale over chromatic). notes: [] = all notes from scale. */
  displayNotes?: DisplayScale[];
  /** Number of times the user must play the tone to complete. */
  requiredPlays: number;
  instruction: string;
}

/** Musical note duration in sixteenths. Duration in seconds: (value / 4) * (60 / tempo). */
export enum NoteDuration {
  Whole = 16,
  DottedHalf = 12,
  Half = 8,
  DottedQuarter = 6,
  Quarter = 4,
  DottedEighth = 3,
  Eighth = 2,
  Sixteenth = 1,
}

/** A melody timeline event. */
export type MelodyEvent =
  | { type: "note"; target: NoteTarget; duration: NoteDuration; silent?: boolean }
  | { type: "play"; targets: NoteTarget[]; duration: NoteDuration }
  | { type: "pause"; duration: NoteDuration };

/** A scale segment — defines a note pool for a group of melody events. */
export interface MelodyScale extends BaseScale {
  /** Events resolved against this scale's note pool. */
  events: MelodyEvent[];
}

/** A note to display on the canvas with a specific style. */
export interface DisplayNote {
  target: NoteTarget;
  /** "full" = normal band with label (default). "muted" = faint line, no label. */
  style?: "full" | "muted";
}

/** A scale segment defining which notes to show on the canvas and how. */
export interface DisplayScale {
  /** Tonal.js scale name. */
  type: string;
  /** 1-indexed chromatic degree from user's lowest note. */
  root: number;
  /** Notes resolved against this scale's note pool. */
  notes: DisplayNote[];
}

export interface MelodyConfig extends BaseExerciseConfig {
  exerciseTypeId: "melody";
  /** BPM — quarter note = 1 beat. Duration formula: (NoteDuration / 4) * (60 / tempo) seconds. */
  tempo: number;
  /** Scale segments with events — single unified timeline (chords, notes, pauses). */
  melody: MelodyScale[];
  /** Optional override for which notes appear on the canvas. Omit to auto-derive from melody. */
  displayNotes?: DisplayScale[];
  /** Score threshold (0–100) to complete. Always shown. 0 = any score passes. */
  minScore: number;
  instruction: string;
}

/** A cue label with its display duration. */
export interface TimedCue {
  text: string;
  /** How long this cue stays on screen (seconds). Cues cycle until targetSeconds is reached. */
  seconds: number;
}

export interface VolumeDetectionConfig extends BaseExerciseConfig {
  exerciseTypeId: "volume-detection";
  /** Seconds of accumulated sound needed per rep. */
  targetSeconds: number;
  /** Number of reps (defaults to 1). */
  reps?: number;
  /** Timed cue labels that cycle on screen. */
  cues: TimedCue[];
  instruction: string;
}

export interface TimeBasedConfig extends BaseExerciseConfig {
  exerciseTypeId: "time-based";
  /** Flat sequence of timed cues — played once, start to finish. */
  cues: TimedCue[];
  instruction: string;
  /** Rotating tips shown at the bottom during exercise. Omit for no tips. */
  tips?: string[];
}

/** A rhythm timeline event — tap (user must hit) or pause (gap). */
export type RhythmEvent =
  | { type: "tap"; duration: NoteDuration }
  | { type: "pause"; duration: NoteDuration };

export interface RhythmConfig extends BaseExerciseConfig {
  exerciseTypeId: "rhythm";
  /** BPM — quarter note = 1 beat. Duration formula: (NoteDuration / 4) * (60 / tempo) seconds. */
  tempo: number;
  /** Tap/pause sequence defining the rhythm pattern. */
  pattern: RhythmEvent[];
  /** Play an audible click on each beat marker (default false). */
  metronome?: boolean;
  /** Score threshold (0–100) to complete. 0 = any score passes. */
  minScore: number;
  instruction: string;
}

export interface WalkthroughConfig extends BaseExerciseConfig {
  exerciseTypeId: "walkthrough";
}

export type ExerciseConfig =
  | LearnConfig
  | LearnVoiceDrivenConfig
  | LearnNotesConfig
  | PitchDetectionConfig
  | PitchDetectionSlideConfig
  | PitchDetectionHillConfig
  | FarinelliBreathworkConfig
  | FarinelliVoiceDrivenConfig
  | ToneFollowConfig
  | MelodyConfig
  | VolumeDetectionConfig
  | TimeBasedConfig
  | RhythmConfig
  | WalkthroughConfig;

/** Input type for part files — `id`, `chapter`, `chapterSlug`, and `stageId` are assigned automatically in index.ts. */
type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;
export type ExerciseConfigInput = DistributiveOmit<ExerciseConfig, "id" | "chapter" | "chapterSlug" | "stageId">;

// ── Journey structure ─────────────────────────────────────────────────────────

export interface StageConfig {
  /** Stable slug for progress tracking (e.g. "ch1-wake-up", "ch2-warmup"). */
  id: string;
  title: string;
  exercises: ExerciseConfig[];
}

export interface Chapter {
  /** 1-indexed chapter number. */
  chapter: number;
  /** URL-safe slug (e.g. "introduction"). */
  slug: string;
  title: string;
  description: string;
  /** Secret chapters show "???" when locked, no chapter number. */
  secret?: boolean;
  /** Warmup stage — prompted if >4h since last warmup. Chapter 1 has none. */
  warmup?: StageConfig;
  stages: StageConfig[];
}

export interface StageConfigInput {
  id: string;
  title: string;
  exercises: ExerciseConfigInput[];
}

export interface ChapterInput {
  chapter: number;
  slug: string;
  title: string;
  description: string;
  /** Secret chapters show "???" when locked, no chapter number. */
  secret?: boolean;
  warmup?: StageConfigInput;
  stages: StageConfigInput[];
}
