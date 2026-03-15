// ── Exercise config types ────────────────────────────────────────────────────
// These types drive canvas selection, progress tracking, detection tolerance,
// and tone playback. See specs/exercise-config-flow.md for the full mapping.
// If you change these types, update the spec to match.

/**
 * Determines which canvas, progress model, and UI the exercise renders.
 */
export type StageTypeId =
  | "learn"                   // text + video placeholder, no exercise
  | "pitch-detection"         // hold tone(s) — single note or sequence
  | "pitch-detection-slide"   // glide between two pitches
  | "breathwork";             // Farinelli breathing cycles, no pitch detection

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

// ── Layer 1: Base ─────────────────────────────────────────────────────────────

/** Fields shared by all stage types. */
export interface BaseJourneyStage {
  /** Unique stage ID (1–116). IDs are stable; gaps exist where parts are disabled. */
  id: number;
  stageTypeId: StageTypeId;
  /** Part number (1–20). Shown in headers and part-complete modals. */
  part: number;
  title: string;
  /** Secondary text shown in exercise header. */
  subtitle?: string;
  /** Short description shown on the journey list card (falls back to subtitle). */
  cardCue?: string;
  /** Vocal technique — controls detection tolerance and playback style. */
  technique?: TechniqueId;
}

// ── Layer 2: Specific stage types ─────────────────────────────────────────────

export interface LearnStage extends BaseJourneyStage {
  stageTypeId: "learn";
  /** Markdown-ish text shown as scrollable content. */
  instruction: string;
}

export interface PitchDetectionStage extends BaseJourneyStage {
  stageTypeId: "pitch-detection";
  /** One note = single-tone hold; multiple = sing in sequence. */
  notes: SustainNoteConfig[];
  instruction: string;
}

export interface PitchDetectionSlideStage extends BaseJourneyStage {
  stageTypeId: "pitch-detection-slide";
  /** Typically one slide config (from → to). */
  notes: SlideConfig[];
  instruction: string;
}

export interface BreathworkStage extends BaseJourneyStage {
  stageTypeId: "breathwork";
  /** Number of breathing cycles to complete (typically 7). */
  maxCount: number;
  instruction: string;
}

export type JourneyStage =
  | LearnStage
  | PitchDetectionStage
  | PitchDetectionSlideStage
  | BreathworkStage;
