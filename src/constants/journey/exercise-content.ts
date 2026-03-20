// ── Exercise Content Generator ────────────────────────────────────────────────
// Generates exercise text content (instructions, subtitles, tips) based on
// parameters like vowel, reps, variant. Uses a Template Registry pattern —
// each content type is a template function that produces all text fields.
//
// Content is inspired by the hand-written copy in chapter files. Each vowel,
// interval, and scale type has distinct language matching the originals.
//
// Variant controls progression depth:
//   "introduction" — simple, reassuring, fewer tips
//   "intermediate" — adds awareness cues, more tips
//   "advanced"     — adds nuance, technique refinement, full tips

import {
  HUMMING_TIPS,
  VOWEL_TIPS,
  HEAD_VOICE_TIPS,
  LIP_ROLL_TIPS,
  BREATH_SOUND_TIPS,
  SUSTAIN_TIPS,
  SLIDE_TIPS,
  MELODY_TIPS,
  CHAKRA_TIPS,
} from "./exercise-tips";
import { FARINELLI_TIPS } from "@/constants/farinelli-tips";

// ── Types ────────────────────────────────────────────────────────────────────

export type ContentVariant = "introduction" | "intermediate" | "advanced";

export interface ExerciseContent {
  /** 1–3 line instruction shown on the exercise canvas. */
  instruction: string;
  /** Compact descriptor for exercise header. */
  headerSubtitle: string;
  /** Engagement hook shown on journey card. */
  cardSubtitle: string;
  /** 4-section intro text (do → feel → reason → reassurance), separated by \n\n. */
  introInstruction: string;
  /** Progressive subset of tips for the intro modal. */
  tips: string[];
}

// ── Tip lookup ───────────────────────────────────────────────────────────────
// Simple, efficient: category + variant → tips. No content object needed.

const tipPools = {
  hum: HUMMING_TIPS,
  vowel: VOWEL_TIPS,
  headVoice: HEAD_VOICE_TIPS,
  lipRoll: LIP_ROLL_TIPS,
  breathSound: BREATH_SOUND_TIPS,
  sustain: SUSTAIN_TIPS,
  slide: SLIDE_TIPS,
  melody: MELODY_TIPS,
  rhythm: MELODY_TIPS,
  farinelli: FARINELLI_TIPS,
  chakra: CHAKRA_TIPS,
} as const;

export type TipCategory = keyof typeof tipPools;

/** Returns a progressive subset of tips based on variant. */
function progressiveTips(pool: readonly string[], variant: ContentVariant): string[] {
  if (pool.length === 0) return [];
  switch (variant) {
    case "introduction":
      return pool.slice(0, 2) as string[];
    case "intermediate":
      return pool.slice(0, 3) as string[];
    case "advanced":
      return pool.slice(0, 5) as string[];
  }
}

/**
 * Simple tip lookup — just category + variant, no params needed.
 *
 * Usage:
 *   tips: exerciseTips("hum", "introduction")   // → 2 humming tips
 *   tips: exerciseTips("vowel", "advanced")      // → 5 vowel tips
 */
export function exerciseTips(category: TipCategory, variant: ContentVariant): string[] {
  return progressiveTips(tipPools[category], variant);
}

// ── Content templates ────────────────────────────────────────────────────────
// Each template produces an ExerciseContent inspired by the original
// hand-written chapter copy. Call exerciseContent.*() when you need the
// full content object; use exerciseTips() when you only need tips.

// ── Hum ──────────────────────────────────────────────────────────────────────

export interface HumContentParams {
  seconds: number;
  reps: number;
  variant: ContentVariant;
}

function humContent(p: HumContentParams): ExerciseContent {
  const base: ExerciseContent = {
    headerSubtitle: `Hum · ${p.seconds} seconds × ${p.reps}`,
    cardSubtitle: "Your first pitched sound — a low, steady hum",
    instruction:
      "Hum mmmm on a low tone.\nKeep the sound steady — feel the buzz in your lips.\nBreathe whenever you need to.",
    introInstruction:
      "Close your lips and hum mmmm on a low tone. Keep the sound steady.\n\nFeel the buzz in your lips and teeth. Notice if it spreads into your chest.\n\nHumming is the simplest way to connect your voice to your body. It warms up your vocal cords and helps you find where sound lives.\n\nBreathe whenever you need to — there's no rush. There's no wrong way to hum.",
    tips: exerciseTips("hum", p.variant),
  };

  if (p.variant === "intermediate") {
    base.cardSubtitle = "Reconnect with a steady hum — feel the buzz";
    base.instruction =
      "Hum mmmm on a low tone.\nNotice where the buzz lives — lips, teeth, chest.\nBreathe whenever you need to.";
    base.introInstruction =
      "Close your lips and hum mmmm on a low tone. Let it wobble gently.\n\nFeel the buzz in your lips and chest. Notice where the warmth settles.\n\nHumming grounds your voice in your body — the simplest way to reconnect.\n\nBreathe whenever you need to. There's no wrong way to hum.";
  }

  if (p.variant === "advanced") {
    base.cardSubtitle = "Deepen the hum — explore resonance placement";
    base.instruction =
      "Hum mmmm on a low tone.\nFeel how the resonance shifts as the pitch rises.\nStay relaxed. Let the sound arrive.";
    base.introInstruction =
      "Hum mmmm on a mid tone — a step higher than before. Keep it relaxed.\n\nNotice the buzz in your chest and face. Feel how the resonance shifts as the pitch rises.\n\nEach pitch lives in a different place in your body. This awareness stays with you.\n\nStay relaxed. Let the sound arrive.";
  }

  return base;
}

// ── Vowel sustain ────────────────────────────────────────────────────────────
// Each vowel has distinct mouth shape and resonance — not interchangeable.

export interface VowelSustainContentParams {
  vowel: string;
  seconds: number;
  reps: number;
  variant: ContentVariant;
}

/** Per-vowel descriptions from original chapter content. */
interface VowelProfile {
  example: string;
  mouthShape: string;
  resonance: string;
  character: string;
  headerLabel: string;
}

const vowelProfiles: Record<string, VowelProfile> = {
  uu: {
    example: "moon",
    mouthShape: "Keep your mouth rounded like Uu — relaxed, not smiling.",
    resonance: "Notice where the resonance lands — chest, throat, or somewhere in between.",
    character: "This vowel naturally opens your chest voice. It's the warmest, most grounding sound you can make.",
    headerLabel: "Chest voice",
  },
  oo: {
    example: "go",
    mouthShape: "Keep your mouth rounded and open — wider than Uu.",
    resonance: "Feel the warmth settle in your chest. Notice how the extra openness changes the resonance compared to Uu.",
    character: "Oo opens your throat and introduces a rounder, warmer quality to your voice.",
    headerLabel: "Oo vowel",
  },
  ah: {
    example: "father",
    mouthShape: "Open your mouth wide — drop your jaw and let your tongue rest low.",
    resonance: "Feel the openness in your throat. Notice how the sound fills your chest differently than Uu or Oo.",
    character: "Ah is the most open vowel. It teaches your voice to project without pushing.",
    headerLabel: "Ah vowel",
  },
  ee: {
    example: "see",
    mouthShape: "Let the sound project forward — bright, focused, resonating in your face.",
    resonance: "Notice where the buzz lands. Feel it in your sinuses, your cheekbones, the front of your mouth. That's forward placement.",
    character: "Ee teaches your voice to find the mask — the place where sound carries furthest with the least effort.",
    headerLabel: "Ee vowel",
  },
  oh: {
    example: "go",
    mouthShape: "Keep your mouth rounded and open.",
    resonance: "Feel the warmth settle in your chest.",
    character: "Oh opens your throat with a warm, round quality.",
    headerLabel: "Oh vowel",
  },
};

function vowelSustainContent(p: VowelSustainContentParams): ExerciseContent {
  const vowelLower = p.vowel.toLowerCase();
  const profile = vowelProfiles[vowelLower] ?? {
    example: p.vowel,
    mouthShape: `Keep your mouth shaped like ${p.vowel} — relaxed, not smiling.`,
    resonance: "Notice where the resonance lands.",
    character: "This vowel opens your voice and grounds you in your body.",
    headerLabel: `${p.vowel} vowel`,
  };

  // Ee is mid-high, others are low
  const pitchLabel = vowelLower === "ee" ? "in your mid-high range" : "on a low tone";
  const soundLabel = `${vowelLower}${vowelLower}${vowelLower}${vowelLower}`;

  const base: ExerciseContent = {
    headerSubtitle: `${profile.headerLabel} · ${p.seconds} seconds × ${p.reps}`,
    cardSubtitle: `A low ${p.vowel} that settles in your chest`,
    instruction:
      `Sing ${soundLabel} (as in '${profile.example}') ${pitchLabel}.\n${profile.mouthShape}\nBreathe whenever you need to.`,
    introInstruction:
      `Sing ${soundLabel} (as in '${profile.example}') ${pitchLabel}. ${profile.mouthShape}\n\n${profile.resonance}\n\n${profile.character}\n\nBreathe whenever you need to — there's no rush.`,
    tips: exerciseTips("vowel", p.variant),
  };

  // Ee-specific card subtitle
  if (vowelLower === "ee") {
    base.cardSubtitle = `Feel the brightness land in your face — forward and focused`;
  }

  if (p.variant === "intermediate") {
    base.cardSubtitle = `Sustain ${p.vowel} — notice the resonance shift`;
    base.instruction =
      `Sing ${soundLabel} (as in '${profile.example}') ${pitchLabel}.\nNotice where the resonance sits — chest, throat, face.\nLet the tone settle naturally.`;
    base.introInstruction =
      `Sing ${soundLabel} (as in '${profile.example}') ${pitchLabel}. ${profile.mouthShape}\n\nNotice where the resonance sits and whether it moves as you sustain. Chest? Throat? Face?\n\nSustaining a vowel builds your awareness of resonance placement — the foundation of vocal control.\n\nKeep it gentle. No need to push.`;
  }

  if (p.variant === "advanced") {
    base.cardSubtitle = `Sustain ${p.vowel} — the longest holds yet`;
    base.instruction =
      `Sing ${soundLabel} (as in '${profile.example}') ${pitchLabel}.\nFeel the resonance deepen as you sustain.\nBreathe whenever you need to.`;
    base.introInstruction =
      `Sing ${soundLabel} (as in '${profile.example}') ${pitchLabel}. Hold for ${p.seconds} seconds — the longest holds yet.\n\nFeel how the resonance deepens the longer you sustain. Notice your breath settling into a rhythm.\n\nLonger holds carry your vowel further and build the stability behind your voice.\n\nBreathe whenever you need to. There's no rush.`;
  }

  return base;
}

// ── Head voice ───────────────────────────────────────────────────────────────

export interface HeadVoiceContentParams {
  sound: string;
  seconds: number;
  reps: number;
  variant: ContentVariant;
}

function headVoiceContent(p: HeadVoiceContentParams): ExerciseContent {
  const base: ExerciseContent = {
    headerSubtitle: `Head voice · ${p.seconds} seconds × ${p.reps}`,
    cardSubtitle: `Find your head voice — light, owl-like, floating`,
    instruction:
      `Sing '${p.sound}' on a high tone, like an owl.\nNotice the lightness — the sound lifts into your head.\nKeep it gentle.`,
    introInstruction:
      `Sing '${p.sound}' on a high tone, like an owl calling. Keep it light and gentle.\n\nNotice how the sound lifts — away from your chest and into your head and face.\n\nHead voice is a lighter resonance. Finding it expands your range and gives you access to a completely different quality of sound.\n\nKeep it gentle. You don't need to get this right.`,
    tips: exerciseTips("headVoice", p.variant),
  };

  if (p.variant === "intermediate") {
    base.cardSubtitle = `Sing '${p.sound}' — explore the head voice register`;
    base.instruction =
      `Sing '${p.sound}' on a high tone.\nNotice the lightness — the sound lifts into your head.\nKeep it gentle and easy.`;
    base.introInstruction =
      `Sing '${p.sound}' on a high tone, like an owl calling. Keep it light and easy.\n\nNotice how the sound floats — away from your chest and into your head and face.\n\nHead voice exercises expand your range and wake up a lighter, more agile part of your voice.\n\nKeep it gentle. Just notice what happens.`;
  }

  if (p.variant === "advanced") {
    base.cardSubtitle = `Sing '${p.sound}' — pushing into your upper range`;
    base.instruction =
      `Sing '${p.sound}' higher than before — pushing into your upper range.\nNotice the lightness — the sound floats.\nKeep it gentle.`;
    base.introInstruction =
      `Sing '${p.sound}' on a higher tone than before — reaching further into your head voice.\n\nNotice how the sound floats — lighter, more agile, further from your chest.\n\nPushing your head voice boundary expands the top of your range and builds flexibility.\n\nKeep it gentle. You don't need to get this right.`;
  }

  return base;
}

// ── Lip roll ─────────────────────────────────────────────────────────────────

export interface LipRollContentParams {
  direction: "low-to-high" | "high-to-low" | "full-range" | "sustained";
  requiredPlays: number;
  variant: ContentVariant;
}

function lipRollContent(p: LipRollContentParams): ExerciseContent {
  const dirLabel =
    p.direction === "low-to-high" ? "low to high"
    : p.direction === "high-to-low" ? "high to low"
    : p.direction === "full-range" ? "across your full range"
    : "at a steady pitch";

  if (p.direction === "sustained") {
    return {
      headerSubtitle: `Hold the buzz · play ${p.requiredPlays} times`,
      cardSubtitle: "Keep the buzz steady — lips vibrating without force",
      instruction:
        "Lip roll alongside the tone.\nKeep the buzz steady — lips vibrating without force.\nNotice where the resonance sits.",
      introInstruction:
        `Play the tone and lip roll alongside it. Hold the buzz at a steady pitch.\n\nNotice where the resonance sits — lips, face, or deeper. Feel the vibration without forcing it.\n\nSustaining a lip roll at one pitch trains your breath control and builds stability. It's practice for holding any tone steady.\n\nTake a breath between each one.`,
      tips: exerciseTips("lipRoll", p.variant),
    };
  }

  const base: ExerciseContent = {
    headerSubtitle: `Glide ${dirLabel} · play ${p.requiredPlays} times`,
    cardSubtitle: `Lip roll ${dirLabel} — loosen up`,
    instruction:
      `Lip roll alongside the tone.\nSlide smoothly ${dirLabel} — loosen your lips.`,
    introInstruction:
      `Play the tone and lip roll alongside it. Slide smoothly ${dirLabel}.\n\nFeel the buzz travel through your lips. Notice how the resonance shifts as the pitch ${p.direction === "low-to-high" ? "rises" : "moves"}.\n\nLip rolls loosen tension and wake up the connection between breath and voice.\n\nDon't worry about matching exactly. Just follow the movement.`,
    tips: exerciseTips("lipRoll", p.variant),
  };

  if (p.direction === "full-range") {
    base.cardSubtitle = "Lip roll — full range, low to high";
    base.introInstruction =
      `Play the tone and lip roll alongside it. Slide smoothly from your lowest to your highest — your full range.\n\nFeel the buzz travel through your entire voice. Notice how the resonance shifts from chest to head as you glide.\n\nFull-range lip rolls loosen everything and connect your registers into one continuous sound.\n\nDon't worry about matching exactly. Just follow the movement.`;
  }

  return base;
}

// ── Breath sound ─────────────────────────────────────────────────────────────

export interface BreathSoundContentParams {
  sounds: string[];
  totalSeconds: number;
  variant: ContentVariant;
}

function breathSoundContent(p: BreathSoundContentParams): ExerciseContent {
  const soundList = p.sounds.join("-");
  const hasPair = p.sounds.length > 1;

  const base: ExerciseContent = {
    headerSubtitle: `Breath sound · ${p.totalSeconds} seconds`,
    cardSubtitle: `${soundList} — all breath, no voice`,
    instruction: hasPair
      ? `Alternate ${soundList} — feel the vibration shift.\nIt's okay to take breaths between sounds.`
      : `Make a steady ${p.sounds[0]} sound — no pitch needed, just breath.\nIt's okay to take breaths between sounds.`,
    introInstruction: hasPair
      ? `Alternate between ${p.sounds[0]} and ${p.sounds[1]} sounds. Feel how ${p.sounds[0]} is just air and ${p.sounds[1]} adds voice. Follow along with the cues.\n\nNotice the vibration shift — from voiceless to voiced and back.\n\nThis wakes up your breath and reconnects you to where sound starts.\n\nKeep your mouth relaxed. There's no rush.`
      : `Make a steady ${p.sounds[0]} sound — like air escaping. Follow along with the cues.\n\nNotice how your body settles when you focus on the sound.\n\nThis exercise wakes up your breath control and reconnects you to where sound starts.\n\nKeep your mouth relaxed. There's no rush.`,
    tips: exerciseTips("breathSound", p.variant),
  };

  if (p.variant === "intermediate") {
    base.cardSubtitle = hasPair
      ? `${soundList} — notice the voicing threshold`
      : `${soundList} — steady breath control`;
    if (hasPair) {
      base.instruction =
        `Alternate ${soundList} — feel the vibration shift.\nNotice the exact moment voice arrives.\nKeep your breath steady and even.`;
    }
  }

  if (p.variant === "advanced") {
    base.cardSubtitle = `Extended ${soundList} — longer holds`;
    if (hasPair) {
      base.instruction =
        `Alternate ${soundList} — longer holds this time.\nFeel the vibration shift between voiceless and voiced.\nIt's okay to pause between sounds.`;
    }
  }

  return base;
}

// ── Slide ────────────────────────────────────────────────────────────────────

export interface SlideContentParams {
  direction: "low-to-high" | "high-to-low" | "full-range";
  variant: ContentVariant;
}

function slideContent(p: SlideContentParams): ExerciseContent {
  const dirLabel =
    p.direction === "low-to-high" ? "low to high"
    : p.direction === "high-to-low" ? "high to low"
    : "through your full range";

  const base: ExerciseContent = {
    headerSubtitle: `Slide ${dirLabel}`,
    cardSubtitle: `Glide ${dirLabel} — smooth and continuous`,
    instruction:
      `Slide your voice ${dirLabel}.\nKeep the movement smooth — no steps or jumps.\nBreathe when you need to.`,
    introInstruction:
      `Slide your voice ${dirLabel}. Move smoothly between pitches.\n\nFeel how your voice transitions through different registers.\n\nSlides build flexibility and reveal where your voice moves freely or gets stuck.\n\nDon't worry about matching any specific pitch. Just move.`,
    tips: exerciseTips("slide", p.variant),
  };

  if (p.variant === "intermediate") {
    base.cardSubtitle = `Glide ${dirLabel} — map your transitions`;
    base.instruction =
      `Slide your voice ${dirLabel}.\nNotice where register transitions happen.\nKeep the movement continuous.`;
  }

  if (p.variant === "advanced") {
    base.cardSubtitle = `Glide ${dirLabel} — smooth the breaks`;
    base.instruction =
      `Slide your voice ${dirLabel}.\nSmooth out any register breaks or cracks.\nMaintain even airflow throughout the glide.`;
  }

  return base;
}

// ── Scale ────────────────────────────────────────────────────────────────────
// Each scale type has its own character from the originals.

export interface ScaleContentParams {
  scaleType: "major" | "minor" | "pentatonic" | "chromatic";
  variant: ContentVariant;
  minScore?: number;
}

/** Per-scale character from original chapter content. */
const scaleCharacter: Record<string, { card: string; reason: string }> = {
  major: {
    card: "the sound of home",
    reason: "The major scale is the foundation of melody. Every song you know lives inside it.",
  },
  minor: {
    card: "a darker, more expressive colour",
    reason: "The minor scale opens up a different emotional landscape — darker, more expressive.",
  },
  pentatonic: {
    card: "five notes that feel like home",
    reason: "The pentatonic scale is the most universal melodic pattern — it appears in every musical tradition on earth.",
  },
  chromatic: {
    card: "every note, no gaps",
    reason: "The chromatic scale uses every note — it builds precision and trains your ear for fine pitch differences.",
  },
};

function scaleContent(p: ScaleContentParams): ExerciseContent {
  const label = p.scaleType;
  const character = scaleCharacter[label] ?? scaleCharacter.major;
  const scoreNote = p.minScore
    ? `\n\nMatch ${p.minScore}% to continue. Just follow the sound.`
    : "";

  const base: ExerciseContent = {
    headerSubtitle: `${label} scale · up and back down`,
    cardSubtitle: `A full ${label} scale — ${character.card}`,
    instruction:
      `Sing each note as it scrolls past.\nUp the scale and back down — follow the piano.\nListen first, then match.`,
    introInstruction:
      `Sing a full ${label} scale — up and back down. The piano plays each note for you.\n\nFeel the steps between notes. Notice how the scale has a shape — rising tension, then release coming home.\n\n${character.reason}${scoreNote}\n\nThere's no rush. Listen first, then follow.`,
    tips: exerciseTips("melody", p.variant),
  };

  if (p.variant === "intermediate") {
    base.cardSubtitle = `Sing the ${label} scale — connect the notes`;
    base.instruction =
      `Sing each note as it scrolls past.\nConnect each note smoothly to the next.\nKeep your tone even across the range.`;
  }

  if (p.variant === "advanced") {
    base.cardSubtitle = `The ${label} scale with sharper accuracy`;
    base.instruction =
      `Sing the ${label} scale at a faster tempo.\nPrecision matters — aim for each note cleanly.\nListen first, then match.`;
  }

  return base;
}

// ── Interval ─────────────────────────────────────────────────────────────────
// Each interval has specific language from originals.

export interface IntervalContentParams {
  intervalName: string;
  variant: ContentVariant;
}

/** Per-interval descriptions from original chapter content. */
const intervalCharacter: Record<string, { card: string; feel: string; reason: string }> = {
  "major second": {
    card: "just two adjacent notes",
    feel: "Notice the distance between the notes. Feel how your voice shifts — even a small step changes where the sound lives.",
    reason: "This is your first melody. Two notes, one small step. Everything larger builds from here.",
  },
  "perfect fifth": {
    card: "a leap of a fifth",
    feel: "Feel the leap in your body. Notice how the higher note lifts and the lower note grounds.",
    reason: "Wider intervals stretch your voice and build confidence in jumping between distant pitches.",
  },
  octave: {
    card: "a full octave apart",
    feel: "Feel the leap in your body. Notice how the lower note grounds and the higher note lifts — the full span of your voice in two notes.",
    reason: "Octave leaps stretch your range and build confidence in moving between your registers.",
  },
};

function intervalContent(p: IntervalContentParams): ExerciseContent {
  const character = intervalCharacter[p.intervalName] ?? {
    card: `a ${p.intervalName} interval`,
    feel: "Feel the distance between the two notes. Let your ear guide you.",
    reason: "Interval training builds relative pitch — the ability to find notes by feel rather than memory.",
  };

  const base: ExerciseContent = {
    headerSubtitle: `Sing ${p.intervalName} · listen and match`,
    cardSubtitle: `Your ${p.intervalName === "major second" ? "first melody" : "widest leap yet"} — ${character.card}`,
    instruction:
      `Sing the two notes as they appear.\nListen and match — ${p.intervalName === "major second" ? "this is the smallest melodic step" : "a wider leap this time"}.\nThere's no rush. Just notice the distance between them.`,
    introInstruction:
      `Sing the two notes as they appear — the piano plays each one for you. Match what you hear.\n\n${character.feel}\n\n${character.reason}\n\nThere's no rush. Listen first, then follow.`,
    tips: exerciseTips("melody", p.variant),
  };

  if (p.variant === "intermediate") {
    base.instruction =
      `Sing the two notes as they appear — a wider leap this time.\nListen to the piano and match the jump.\nLet your voice move freely between the notes.`;
  }

  if (p.variant === "advanced") {
    base.instruction =
      `Sing the two notes as they appear — a full ${p.intervalName} apart.\nListen to the piano and match the leap.\nLet your voice move freely between low and high.`;
  }

  return base;
}

// ── Farinelli ────────────────────────────────────────────────────────────────
// Uses exact phrasing from originals.

export interface FarinelliContentParams {
  maxCount: number;
  variant: ContentVariant;
}

function farinelliContent(p: FarinelliContentParams): ExerciseContent {
  const base: ExerciseContent = {
    headerSubtitle: `Breathwork · ${p.maxCount} cycles`,
    cardSubtitle: "Slow down. Breathe deep. Feel your body settle",
    instruction: "",
    introInstruction:
      "Inhale, hold, and exhale for the same count — each cycle adds one beat.\n\nNotice how your body settles as the rhythm deepens.",
    tips: exerciseTips("farinelli", p.variant),
  };

  if (p.variant === "intermediate") {
    base.cardSubtitle = "Return to breath. Let everything slow down";
    base.introInstruction =
      "Inhale, hold, and exhale for the same count — each cycle adds one beat.\n\nDeeper breathing this time. Notice how your body responds as the rhythm lengthens.";
  }

  if (p.variant === "advanced") {
    base.cardSubtitle = "The deepest breathing yet";
    base.introInstruction =
      "Inhale, hold, and exhale for the same count — each cycle adds one beat.\n\nThe deepest breathing yet. Notice how your body responds as the rhythm lengthens. Feel everything settle.";
  }

  return base;
}

// ── Zone ─────────────────────────────────────────────────────────────────────

export interface ZoneContentParams {
  zone: "below" | "above" | "between";
  seconds: number;
  reps: number;
  variant: ContentVariant;
}

function zoneContent(p: ZoneContentParams): ExerciseContent {
  const zoneLabel =
    p.zone === "below" ? "in your lower range"
    : p.zone === "above" ? "in your upper range"
    : "in the target zone";

  const base: ExerciseContent = {
    headerSubtitle: `Hold ${zoneLabel} · ${p.seconds}s × ${p.reps}`,
    cardSubtitle: `Sing ${zoneLabel} — hold the tone steady`,
    instruction:
      `Sing a tone ${zoneLabel}.\nHold it steady for ${p.seconds} seconds.\nAny pitch in the zone counts.`,
    introInstruction:
      `Sing a tone ${zoneLabel}. Any pitch in the zone works — just hold it steady.\n\nNotice how it feels to stay in this part of your voice.\n\nZone exercises build comfort and control in specific registers.\n\nThere's no wrong note. Just stay in the zone.`,
    tips: exerciseTips("sustain", p.variant),
  };

  if (p.variant === "intermediate") {
    base.cardSubtitle = `Sing ${zoneLabel} — explore the register`;
    base.instruction =
      `Sing a tone ${zoneLabel}.\nHold it steady — notice the resonance.\nTry slightly different pitches each rep.`;
  }

  if (p.variant === "advanced") {
    base.cardSubtitle = `Sing ${zoneLabel} — refine register control`;
    base.instruction =
      `Sing a tone ${zoneLabel}.\nChoose a specific pitch and hold it precisely.\nMaintain consistent resonance placement.`;
  }

  return base;
}

// ── Chakra ────────────────────────────────────────────────────────────────────

export interface ChakraContentParams {
  chakra: string;
  vowel: string;
  variant: ContentVariant;
}

function chakraContent(p: ChakraContentParams): ExerciseContent {
  const base: ExerciseContent = {
    headerSubtitle: `${p.chakra} · ${p.vowel}`,
    cardSubtitle: `${p.vowel} — feel the ${p.chakra.toLowerCase()} resonate`,
    instruction:
      `Sing ${p.vowel} and direct the vibration to your ${p.chakra.toLowerCase()}.\nLet the mantra hum through you.\nNotice what you feel.`,
    introInstruction:
      `Sing ${p.vowel} and feel where the vibration lands. Direct it toward your ${p.chakra.toLowerCase()}.\n\nEach tone maps to a place in your body. Let the sound find its home.\n\nThis isn't about belief — it's about awareness. Where does the vibration travel?\n\nStart quietly. Let the sound grow from inside.`,
    tips: exerciseTips("chakra", p.variant),
  };

  if (p.variant === "intermediate") {
    base.instruction =
      `Sing ${p.vowel} and feel the ${p.chakra.toLowerCase()} vibration.\nNotice how it differs from other placements.\nLet the sound settle deeply.`;
  }

  if (p.variant === "advanced") {
    base.instruction =
      `Sing ${p.vowel} and direct resonance precisely to your ${p.chakra.toLowerCase()}.\nExplore the edges — where does the vibration fade?\nMaintain focused placement throughout.`;
  }

  return base;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Full content generation — use when creating new exercises or when you
 * need instruction text, subtitles, AND tips together.
 *
 * For tips only, use exerciseTips() instead — it's simpler and faster.
 */
export const exerciseContent = {
  hum: humContent,
  vowelSustain: vowelSustainContent,
  headVoice: headVoiceContent,
  lipRoll: lipRollContent,
  breathSound: breathSoundContent,
  slide: slideContent,
  scale: scaleContent,
  interval: intervalContent,
  farinelli: farinelliContent,
  zone: zoneContent,
  chakra: chakraContent,
} as const;

export type ExerciseContentType = keyof typeof exerciseContent;
