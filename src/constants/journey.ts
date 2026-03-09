import type { ChakraId } from "./chakras";

export type JourneyStageType = "technique_intro" | "individual" | "sequence";

export type TechniqueId =
  | "sustain"
  | "mantra"
  | "vowel-u"
  | "vowel-ee"
  | "vowel-flow"
  | "puffy-cheeks"
  | "lip-rolls";

/** For chakra exercises: full (first time), brief (mantra + fact), minimal (warmup — tone only) */
export type ChakraDetailStyle = "full" | "brief" | "minimal";

export interface JourneyStage {
  id: number;
  part: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  title: string;
  instruction: string;
  chakraIds: ChakraId[];
  type: JourneyStageType;
  /** For technique_intro: technique being introduced. For others: technique to use. */
  technique?: TechniqueId;
  /** For chakra exercises: show full chakra card or brief (mantra + interesting fact) */
  chakraDetailStyle?: ChakraDetailStyle;
  holdSeconds: number;
  noteSeconds: number;
}

export const TOTAL_JOURNEY_STAGES = 44;

export const JOURNEY_STAGES: JourneyStage[] = [
  // ── Part 1: Vocal warmups (lip rolls) ──────────────────────────────────────
  {
    id: 1,
    part: 1,
    type: "technique_intro",
    title: "Lip rolls",
    chakraIds: [],
    holdSeconds: 0,
    noteSeconds: 0,
    technique: "lip-rolls",
    instruction:
      "Lip rolls are a vocal warmup where you let your lips buzz loosely — like a motorboat — while you sing. They're one of the gentlest ways to start: the buzz relaxes your jaw, warms your voice, and encourages steady breath without strain. Many singers and voice teachers use them first, before scales or songs. Do them for a few minutes before each session — your voice will thank you.",
  },
  {
    id: 2,
    part: 1,
    type: "sequence",
    title: "Lip rolls — high to low",
    chakraIds: ["crown", "third-eye", "throat", "heart", "solar-plexus", "sacral", "root"],
    holdSeconds: 0,
    noteSeconds: 2,
    technique: "lip-rolls",
    instruction:
      "Lip roll from high to low. Two seconds per tone. Descending first — easier when your voice is cold.",
  },
  {
    id: 3,
    part: 1,
    type: "sequence",
    title: "Lip rolls — low to high",
    chakraIds: ["root", "sacral", "solar-plexus", "heart", "throat", "third-eye", "crown"],
    holdSeconds: 0,
    noteSeconds: 2,
    technique: "lip-rolls",
    instruction:
      "Lip roll from low to high. Two seconds per tone. Each pitch once.",
  },
  {
    id: 4,
    part: 1,
    type: "individual",
    title: "Sustain a lip roll",
    chakraIds: ["heart"],
    holdSeconds: 5,
    noteSeconds: 0,
    technique: "lip-rolls",
    chakraDetailStyle: "minimal",
    instruction:
      "Hold one tone and sustain the lip roll for five seconds. Keep the buzz steady — lips vibrating without force. Feel the sound in your chest.",
  },

  // ── Part 2: Sustain (foundation) ───────────────────────────────────────────
  {
    id: 5,
    part: 2,
    type: "technique_intro",
    title: "Sustain",
    chakraIds: [],
    holdSeconds: 0,
    noteSeconds: 0,
    technique: "sustain",
    instruction:
      "Sing and hold each tone steadily. Feel where it resonates in your body — lower tones in the chest, higher in the head. There's no rush. Let the sound settle.",
  },
  {
    id: 6,
    part: 2,
    type: "individual",
    title: "Root",
    chakraIds: ["root"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "sustain",
    chakraDetailStyle: "full",
    instruction:
      "This is the Root chakra tone — LAM.\nSing it and feel steady and grounded.\nThis can help you feel safe, present, and at home in your body.",
  },
  {
    id: 7,
    part: 2,
    type: "individual",
    title: "Sacral",
    chakraIds: ["sacral"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "sustain",
    chakraDetailStyle: "full",
    instruction:
      "This is the Sacral chakra tone — VAM.\nMatch it and let the sound flow naturally.\nThis can support creativity, flow, and emotional ease.",
  },
  {
    id: 8,
    part: 2,
    type: "individual",
    title: "Solar Plexus",
    chakraIds: ["solar-plexus"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "sustain",
    chakraDetailStyle: "full",
    instruction:
      "This is the Solar Plexus chakra tone — RAM.\nSing with purpose and feel your centre.\nThis can support confidence and personal power.",
  },
  {
    id: 9,
    part: 2,
    type: "individual",
    title: "Heart",
    chakraIds: ["heart"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "sustain",
    chakraDetailStyle: "full",
    instruction:
      "This is the Heart chakra tone — YAM.\nTake a soft breath and sing openly.\nThis can support compassion, connection, and emotional balance.",
  },
  {
    id: 10,
    part: 2,
    type: "individual",
    title: "Throat",
    chakraIds: ["throat"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "sustain",
    chakraDetailStyle: "full",
    instruction:
      "This is the Throat chakra tone — HAM.\nSing clearly and let your voice be heard.\nThis can support honest expression and clear communication.",
  },
  {
    id: 11,
    part: 2,
    type: "individual",
    title: "Third Eye",
    chakraIds: ["third-eye"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "sustain",
    chakraDetailStyle: "full",
    instruction:
      "This is the Third Eye chakra tone — OM.\nSing gently and turn your attention inward.\nThis can support intuition, clarity, and expanded perception.",
  },
  {
    id: 12,
    part: 2,
    type: "individual",
    title: "Crown",
    chakraIds: ["crown"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "sustain",
    chakraDetailStyle: "full",
    instruction:
      "This is the Crown chakra tone — AH.\nStay soft as you move into this higher tone.\nThis can support a sense of peace, presence, and unity.",
  },

  // ── Part 3: Sequences ──────────────────────────────────────────────────────
  {
    id: 13,
    part: 3,
    type: "sequence",
    title: "Root & Sacral",
    chakraIds: ["root", "sacral"],
    holdSeconds: 0,
    noteSeconds: 2,
    technique: "sustain",
    instruction:
      "Sing Root, then Sacral.\nMove from stability into flow.\nThis can help balance grounded energy with creativity.",
  },
  {
    id: 14,
    part: 3,
    type: "sequence",
    title: "Root to Solar Plexus",
    chakraIds: ["root", "sacral", "solar-plexus"],
    holdSeconds: 0,
    noteSeconds: 2,
    technique: "sustain",
    instruction:
      "Sing Root, Sacral, then Solar Plexus.\nFeel the energy rise from grounding into power.\nThis can build inner strength from the base up.",
  },
  {
    id: 15,
    part: 3,
    type: "sequence",
    title: "Root to Heart",
    chakraIds: ["root", "sacral", "solar-plexus", "heart"],
    holdSeconds: 0,
    noteSeconds: 2,
    technique: "sustain",
    instruction:
      "Sing Root through Heart in order.\nKeep each tone smooth and connected.\nThis can help build inner balance from base to heart.",
  },
  {
    id: 16,
    part: 3,
    type: "sequence",
    title: "Heart to Third Eye",
    chakraIds: ["heart", "throat", "third-eye"],
    holdSeconds: 0,
    noteSeconds: 2,
    technique: "sustain",
    instruction:
      "Sing Heart, Throat, then Third Eye.\nLet the tones rise naturally from feeling to vision.\nThis can support emotional openness, expression, and clarity.",
  },
  {
    id: 17,
    part: 3,
    type: "sequence",
    title: "Third Eye & Crown",
    chakraIds: ["third-eye", "crown"],
    holdSeconds: 0,
    noteSeconds: 2,
    technique: "sustain",
    instruction:
      "Sing Third Eye, then Crown.\nStay gentle as you move into the higher tones.\nThis can support clarity, insight, and expanded awareness.",
  },
  {
    id: 18,
    part: 3,
    type: "sequence",
    title: "Full Alignment",
    chakraIds: ["root", "sacral", "solar-plexus", "heart", "throat", "third-eye", "crown"],
    holdSeconds: 0,
    noteSeconds: 2,
    technique: "sustain",
    instruction:
      "Sing all seven chakras from Root to Crown.\nMove slowly and keep your breath relaxed.\nThis can support full-spectrum alignment and integration.",
  },

  // ── Part 4: Vowel U (easiest vowel — uuu first) ─────────────────────────────
  {
    id: 19,
    part: 4,
    type: "technique_intro",
    title: "Vowel U",
    chakraIds: [],
    holdSeconds: 0,
    noteSeconds: 0,
    technique: "vowel-u",
    instruction:
      "Sing uuu (as in 'moon') — lips rounded, tongue back. U is the easiest vowel to start with. It tends to resonate lower in the body. Hold the tone and feel where it lands.",
  },
  {
    id: 20,
    part: 4,
    type: "individual",
    title: "Root — U",
    chakraIds: ["root"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "vowel-u",
    chakraDetailStyle: "brief",
    instruction:
      "Sing uuu on the Root tone.\nFeel the tone in your lower body.",
  },
  {
    id: 21,
    part: 4,
    type: "individual",
    title: "Sacral — U",
    chakraIds: ["sacral"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "vowel-u",
    chakraDetailStyle: "brief",
    instruction:
      "Sing uuu on the Sacral tone.\nLet the sound flow from your lower belly.",
  },
  {
    id: 22,
    part: 4,
    type: "individual",
    title: "Solar Plexus — U",
    chakraIds: ["solar-plexus"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "vowel-u",
    chakraDetailStyle: "brief",
    instruction:
      "Sing uuu on the Solar Plexus tone.\nFeel the power in your centre.",
  },
  {
    id: 23,
    part: 4,
    type: "individual",
    title: "Heart — U",
    chakraIds: ["heart"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "vowel-u",
    chakraDetailStyle: "brief",
    instruction:
      "Sing uuu on the Heart tone.\nOpen and soft — feel it in your chest.",
  },
  {
    id: 24,
    part: 4,
    type: "individual",
    title: "Throat — U",
    chakraIds: ["throat"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "vowel-u",
    chakraDetailStyle: "brief",
    instruction:
      "Sing uuu on the Throat tone.\nClear and true — let your voice be heard.",
  },
  {
    id: 25,
    part: 4,
    type: "individual",
    title: "Third Eye — U",
    chakraIds: ["third-eye"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "vowel-u",
    chakraDetailStyle: "brief",
    instruction:
      "Sing uuu on the Third Eye tone.\nGentle and inward.",
  },
  {
    id: 26,
    part: 4,
    type: "individual",
    title: "Crown — U",
    chakraIds: ["crown"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "vowel-u",
    chakraDetailStyle: "brief",
    instruction:
      "Sing uuu on the Crown tone.\nStay soft and open at the top.",
  },

  // ── Part 5: Mantra ────────────────────────────────────────────────────────
  {
    id: 27,
    part: 5,
    type: "technique_intro",
    title: "Mantra",
    chakraIds: [],
    holdSeconds: 0,
    noteSeconds: 0,
    technique: "mantra",
    instruction:
      "Each chakra has a seed syllable, or mantra. Sing that sound on the tone — LAM for Root, VAM for Sacral, RAM for Solar Plexus, YAM for Heart, HAM for Throat, OM for Third Eye, AH for Crown. The mantra helps focus the vibration in that chakra.",
  },
  {
    id: 28,
    part: 5,
    type: "individual",
    title: "Root — LAM",
    chakraIds: ["root"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "mantra",
    chakraDetailStyle: "brief",
    instruction:
      "Sing LAM on the Root tone. Feel the 'L' and 'M' shape the sound, the 'ah' in the middle carries the pitch.",
  },
  {
    id: 29,
    part: 5,
    type: "individual",
    title: "Sacral — VAM",
    chakraIds: ["sacral"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "mantra",
    chakraDetailStyle: "brief",
    instruction:
      "Sing VAM on the Sacral tone. Let the sound flow from your lower belly.",
  },
  {
    id: 30,
    part: 5,
    type: "individual",
    title: "Solar Plexus — RAM",
    chakraIds: ["solar-plexus"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "mantra",
    chakraDetailStyle: "brief",
    instruction:
      "Sing RAM on the Solar Plexus tone. Feel the power in the 'R' — purpose and centre.",
  },
  {
    id: 31,
    part: 5,
    type: "individual",
    title: "Heart — YAM",
    chakraIds: ["heart"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "mantra",
    chakraDetailStyle: "brief",
    instruction:
      "Sing YAM on the Heart tone. Open and soft — the bridge between body and mind.",
  },
  {
    id: 32,
    part: 5,
    type: "individual",
    title: "Throat — HAM",
    chakraIds: ["throat"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "mantra",
    chakraDetailStyle: "brief",
    instruction:
      "Sing HAM on the Throat tone. Clear and true — let your voice be heard.",
  },
  {
    id: 33,
    part: 5,
    type: "individual",
    title: "Third Eye — OM",
    chakraIds: ["third-eye"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "mantra",
    chakraDetailStyle: "brief",
    instruction:
      "Sing OM on the Third Eye tone. Gentle and inward — clarity and insight.",
  },
  {
    id: 34,
    part: 5,
    type: "individual",
    title: "Crown — AH",
    chakraIds: ["crown"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "mantra",
    chakraDetailStyle: "brief",
    instruction:
      "Sing AH on the Crown tone. Soft and open — presence and unity.",
  },

  // ── Part 6: Vowel EE ──────────────────────────────────────────────────────
  {
    id: 35,
    part: 6,
    type: "technique_intro",
    title: "Vowel EE",
    chakraIds: [],
    holdSeconds: 0,
    noteSeconds: 0,
    technique: "vowel-ee",
    instruction:
      "Sing with EE (as in 'see') — lips spread, tongue forward. EE lifts the resonance higher. It can feel brighter and more energising. Contrast with U to feel the shift.",
  },
  {
    id: 36,
    part: 6,
    type: "individual",
    title: "Root — EE",
    chakraIds: ["root"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "vowel-ee",
    chakraDetailStyle: "brief",
    instruction:
      "Sing Root with EE.\nA low tone with a forward vowel — notice the blend.",
  },
  {
    id: 37,
    part: 6,
    type: "individual",
    title: "Heart — EE",
    chakraIds: ["heart"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "vowel-ee",
    chakraDetailStyle: "brief",
    instruction:
      "Sing Heart with EE.\nFeel the openness in the chest with this vowel.",
  },
  {
    id: 38,
    part: 6,
    type: "individual",
    title: "Crown — EE",
    chakraIds: ["crown"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "vowel-ee",
    chakraDetailStyle: "brief",
    instruction:
      "Sing Crown with EE.\nA high, bright tone — let it lift.",
  },
  // ── Part 7: Vowel flow ────────────────────────────────────────────────────
  {
    id: 39,
    part: 7,
    type: "technique_intro",
    title: "Vowel flow U → EE",
    chakraIds: [],
    holdSeconds: 0,
    noteSeconds: 0,
    technique: "vowel-flow",
    instruction:
      "Hold one tone and smoothly move from U to EE (or back). Keep the pitch steady — only the mouth shape changes. This builds vocal flexibility and awareness of resonance.",
  },
  {
    id: 40,
    part: 7,
    type: "individual",
    title: "Heart — U to EE",
    chakraIds: ["heart"],
    holdSeconds: 5,
    noteSeconds: 0,
    technique: "vowel-flow",
    chakraDetailStyle: "brief",
    instruction:
      "Sing Heart and flow from U to EE. Hold the tone steady, let the vowel glide. Five seconds in tune.",
  },
  // ── Part 8: Puffy cheeks ──────────────────────────────────────────────────
  {
    id: 41,
    part: 8,
    type: "technique_intro",
    title: "Puffy cheeks",
    chakraIds: [],
    holdSeconds: 0,
    noteSeconds: 0,
    technique: "puffy-cheeks",
    instruction:
      "Fill your cheeks with air, then sing the tone without releasing. Your cheeks stay rounded. Hold for a few seconds, then release gently. This develops breath control and teaches you to sing without jaw tension.",
  },
  {
    id: 42,
    part: 8,
    type: "individual",
    title: "Root — Puffy cheeks",
    chakraIds: ["root"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "puffy-cheeks",
    chakraDetailStyle: "brief",
    instruction:
      "Root with puffy cheeks. LAM — feel the grounding while you hold the breath in your cheeks.",
  },
  {
    id: 43,
    part: 8,
    type: "individual",
    title: "Heart — Puffy cheeks",
    chakraIds: ["heart"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "puffy-cheeks",
    chakraDetailStyle: "brief",
    instruction:
      "Heart with puffy cheeks. YAM — stay open in the chest.",
  },
  {
    id: 44,
    part: 8,
    type: "individual",
    title: "Crown — Puffy cheeks",
    chakraIds: ["crown"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "puffy-cheeks",
    chakraDetailStyle: "brief",
    instruction:
      "Crown with puffy cheeks. AH — keep it soft at the top.",
  },
];
