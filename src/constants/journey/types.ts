export type StageTypeId = "intro" | "pitch-detection" | "pitch-detection-slide" | "breathwork";

// ── Band targeting ─────────────────────────────────────────────────────────────

/**
 * Describes which band(s) in the user's vocal scale an exercise targets.
 *
 * - slot: one of 7 evenly-spaced chakra reference points (n=1 lowest / root, n=7 highest / crown)
 * - index: 0-based position in allBands; negative counts from end (-1 = last note)
 * - range: inclusive index range (negative indices supported); used for loose detection exercises
 *   - accept: "below" = any tone at or below the range (chest voice); "above" = any tone at or above (head voice)
 */
export type BandTarget =
  | { kind: "slot"; n: 1 | 2 | 3 | 4 | 5 | 6 | 7 }
  | { kind: "index"; i: number }
  | { kind: "range"; from: number; to: number; accept?: "within" | "below" | "above" };

/** Config for a single sustained pitch — used in pitch-detection stages. */
export type SustainNoteConfig = { target: BandTarget; seconds: number };

/** Config for a slide — used in pitch-detection-slide stages. */
export type SlideConfig = { from: BandTarget; to: BandTarget };

export type TechniqueId = "sustain" | "mantra" | "lip-rolls" | "puffy-cheeks";

// ── Layer 1: Base ─────────────────────────────────────────────────────────────

export interface BaseJourneyStage {
  id: number;
  stageTypeId: StageTypeId;
  part: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  title: string;
  subtitle?: string;
  /** Vocal technique for pitch exercises; used for tolerance (e.g. lip-rolls = looser). */
  technique?: TechniqueId;
}

// ── Layer 2: Specific stage types ─────────────────────────────────────────────

export interface IntroStage extends BaseJourneyStage {
  stageTypeId: "intro";
  instruction: string;
  cardCue?: string;
}

export interface PitchDetectionStage extends BaseJourneyStage {
  stageTypeId: "pitch-detection";
  notes: SustainNoteConfig[];
  instruction: string;
}

export interface PitchDetectionSlideStage extends BaseJourneyStage {
  stageTypeId: "pitch-detection-slide";
  notes: SlideConfig[];
  instruction: string;
}

export interface BreathworkStage extends BaseJourneyStage {
  stageTypeId: "breathwork";
  maxCount: number;
  instruction: string;
  cardCue?: string;
}

export type JourneyStage =
  | IntroStage
  | PitchDetectionStage
  | PitchDetectionSlideStage
  | BreathworkStage;
