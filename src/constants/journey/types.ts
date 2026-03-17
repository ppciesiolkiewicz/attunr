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
  | "pitch-detection"             // hold tone(s) — single note or sequence
  | "pitch-detection-slide"       // glide between two pitches
  | "breathwork-farinelli"        // Farinelli breathing cycles, no pitch detection
  | "tone-follow"                 // play tone and follow along (no mic detection)
  | "melody"                      // sing along to scrolling melody with scoring
  | "volume-detection"            // accumulate sound for targetSeconds to complete
  | "rhythm";                     // tap along to a rhythm pattern

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
 * - index: 1-indexed ChromaticDegree position in the scale's note pool; negative counts from end (-1 = last note)
 * - range: inclusive ChromaticDegree range (negative supported); used for loose detection exercises
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

// ── Layer 1: Base ─────────────────────────────────────────────────────────────

/** Fields shared by all exercise types. */
export interface BaseExerciseConfig {
  /** Unique exercise ID — assigned automatically by index.ts from array position. */
  id: number;
  exerciseTypeId: ExerciseTypeId;
  /** 1-indexed chapter number — assigned automatically by index.ts. */
  chapter: number;
  /** Stage ID slug (e.g. "ch1-wake-up") — assigned automatically by index.ts. */
  stageId: string;
  title: string;
  /** Secondary text shown in exercise header. */
  subtitle?: string;
  /** Short description shown on the journey list card (falls back to subtitle). */
  cardCue?: string;
  /** Shown before exercise starts. */
  introModal?: ModalConfig;
  /** Shown after exercise completes (e.g. part-complete summary). */
  completionModal?: ModalConfig;
  /** Show the "enable practice reminders" toast when this exercise's info modal is displayed. */
  showEnableNotificationsPrompt?: boolean;
}

// ── Layer 2: Specific exercise types ─────────────────────────────────────────

export interface LearnConfig extends BaseExerciseConfig {
  exerciseTypeId: "learn";
  /** Body content rendered as ContentElement[]. */
  elements: ContentElement[];
}

export interface LearnNotesConfig extends BaseExerciseConfig {
  exerciseTypeId: "learn-notes-1";
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

export interface FarinelliBreathworkConfig extends BaseExerciseConfig {
  exerciseTypeId: "breathwork-farinelli";
  /** Number of breathing cycles to complete (typically 7). */
  maxCount: number;
  instruction: string;
}

/** Shared scale definition — specifies which note pool to build. */
export interface BaseScale {
  /** Tonal.js scale name or custom identifier (e.g. "even-7-from-major"). */
  type: string;
  /** 1-indexed chromatic degree from user's lowest note. */
  root: ChromaticDegree;
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

export interface VolumeDetectionConfig extends BaseExerciseConfig {
  exerciseTypeId: "volume-detection";
  /** Seconds of accumulated sound needed to complete. */
  targetSeconds: number;
  /** Cue labels that cycle on screen (e.g. ["sss", "zzz", "sss"]). */
  cues: string[];
  instruction: string;
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

export type ExerciseConfig =
  | LearnConfig
  | LearnNotesConfig
  | PitchDetectionConfig
  | PitchDetectionSlideConfig
  | FarinelliBreathworkConfig
  | ToneFollowConfig
  | MelodyConfig
  | VolumeDetectionConfig
  | RhythmConfig;

/** Input type for part files — `id`, `chapter`, and `stageId` are assigned automatically in index.ts. */
type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;
export type ExerciseConfigInput = DistributiveOmit<ExerciseConfig, "id" | "chapter" | "stageId">;

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
  title: string;
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
  title: string;
  warmup?: StageConfigInput;
  stages: StageConfigInput[];
}
