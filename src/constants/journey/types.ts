// ── Exercise config types ────────────────────────────────────────────────────
// These types drive canvas selection, progress tracking, detection tolerance,
// and tone playback. See specs/exercise-config-flow.md for the full mapping.
// If you change these types, update the spec to match.

/**
 * Determines which canvas, progress model, and UI the exercise renders.
 */
export type ExerciseTypeId =
  | "learn"                       // text + video placeholder, no exercise
  | "pitch-detection"             // hold tone(s) — single note or sequence
  | "pitch-detection-slide"       // glide between two pitches
  | "breathwork-farinelli";       // Farinelli breathing cycles, no pitch detection

// ── Band targeting ─────────────────────────────────────────────────────────────

/**
 * Describes which band(s) in the user's vocal scale an exercise targets.
 *
 * - slot: one of 7 evenly-spaced reference points (n=1 lowest, n=7 highest)
 * - index: 0-based position in allBands; negative counts from end (-1 = last note)
 * - range: inclusive index range (negative indices supported); used for loose detection exercises
 *   - accept: "below" = any tone at or below the range (chest voice); "above" = any tone at or above (head voice)
 */
export type BandTarget =
  | { kind: "slot"; n: 1 | 2 | 3 | 4 | 5 | 6 | 7 }
  | { kind: "index"; i: number }
  | {
      kind: "range";
      from: number;
      to: number;
      accept?: "within" | "below" | "above";
    };

/** A single tone the user must hold in-tune for `seconds`. */
export type SustainNoteConfig = { target: BandTarget; seconds: number };

/** Start and end targets for a pitch glide exercise. */
export type SlideConfig = { from: BandTarget; to: BandTarget };

/**
 * Vocal technique — affects detection tolerance and playback style.
 * e.g. lip-rolls get ±8% tolerance (vs ±3% default) and graduated credit.
 */
export type TechniqueId = "sustain" | "mantra" | "lip-rolls" | "puffy-cheeks";

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
  /** Unique exercise ID (1–116). IDs are stable; gaps exist where parts are disabled. */
  id: number;
  exerciseTypeId: ExerciseTypeId;
  /** Part number (1–20). Shown in headers and completion modals. */
  part: number;
  title: string;
  /** Secondary text shown in exercise header. */
  subtitle?: string;
  /** Short description shown on the journey list card (falls back to subtitle). */
  cardCue?: string;
  /** Vocal technique — controls detection tolerance and playback style. */
  technique?: TechniqueId;
  /** Shown before exercise starts. */
  introModal?: ModalConfig;
  /** Shown after exercise completes (e.g. part-complete summary). */
  completionModal?: ModalConfig;
}

// ── Layer 2: Specific exercise types ─────────────────────────────────────────

export interface LearnExercise extends BaseExerciseConfig {
  exerciseTypeId: "learn";
  /** Body content rendered as ContentElement[]. */
  elements: ContentElement[];
}

export interface PitchDetectionExercise extends BaseExerciseConfig {
  exerciseTypeId: "pitch-detection";
  /** One note = single-tone hold; multiple = sing in sequence. */
  notes: SustainNoteConfig[];
  instruction: string;
}

export interface PitchDetectionSlideExercise extends BaseExerciseConfig {
  exerciseTypeId: "pitch-detection-slide";
  /** Typically one slide config (from → to). */
  notes: SlideConfig[];
  instruction: string;
}

export interface FarinelliBreathworkExercise extends BaseExerciseConfig {
  exerciseTypeId: "breathwork-farinelli";
  /** Number of breathing cycles to complete (typically 7). */
  maxCount: number;
  instruction: string;
}

export type JourneyExercise =
  | LearnExercise
  | PitchDetectionExercise
  | PitchDetectionSlideExercise
  | FarinelliBreathworkExercise;

// ── Journey part ─────────────────────────────────────────────────────────────

export interface JourneyPart {
  part: number;
  title: string;
  exercises: JourneyExercise[];
}
