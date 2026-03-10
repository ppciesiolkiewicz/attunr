import type { ChakraId } from "../chakras";

export type JourneyStageType = "technique_intro" | "individual" | "sequence" | "slide";

export type SlideDirection = "high-to-low" | "low-to-high";

export type TechniqueId =
  | "sustain"
  | "mantra"
  | "vowel-u"
  | "vowel-ee"
  | "vowel-flow"
  | "puffy-cheeks"
  | "lip-rolls";

/** For chakra exercises: full (first time), brief (mantra + fact), minimal (warmup — tone only), rainbow (warmup — tone + rainbow bar, no mantra) */
export type ChakraDetailStyle = "full" | "brief" | "minimal" | "rainbow";

export interface JourneyStage {
  id: number;
  part: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  title: string;
  instruction: string;
  chakraIds: ChakraId[];
  type: JourneyStageType;
  /** For technique_intro: technique being introduced. For others: technique to use. */
  technique?: TechniqueId;
  /** For chakra exercises: show full chakra card or brief (mantra + interesting fact) */
  chakraDetailStyle?: ChakraDetailStyle;
  /** Use rainbow label (all 7 colors) instead of chakra name/mantra — for non-chakra warmups */
  useRainbowLabel?: boolean;
  /** Optional card subtitle; overrides technique display for technique_intro */
  cardCue?: string;
  /** For slide type: direction of continuous glide */
  slideDirection?: SlideDirection;
  holdSeconds: number;
  noteSeconds: number;
}
