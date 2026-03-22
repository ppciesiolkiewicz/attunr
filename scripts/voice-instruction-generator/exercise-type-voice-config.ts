import { journey } from "../../src/constants/journey";
import type { FarinelliBreathworkConfig, LearnVoiceDrivenConfig } from "../../src/constants/journey";
import { FARINELLI_TIPS } from "../../src/constants/farinelli-tips";

export interface VoiceSegment {
  name: string;
  ssml: string;
  /** Which voice to use. Defaults to "instruction". */
  voice?: "instruction" | "tips";
}

// ── Base class ───────────────────────────────────────────────────────────────

export abstract class ExerciseTypeVoiceConfig {
  abstract readonly exerciseTypeId: string;
  abstract segments(): VoiceSegment[];

  static countSequence(n: number): string {
    return Array.from({ length: n }, (_, i) => `${i + 1}`).join(
      ' <break time="1s"/> ',
    );
  }
}

// ── Farinelli ────────────────────────────────────────────────────────────────

class FarinelliVoiceConfig extends ExerciseTypeVoiceConfig {
  readonly exerciseTypeId = "breathwork-farinelli";

  segments(): VoiceSegment[] {
    const farinelliExercises = journey.exercises.filter(
      (e): e is FarinelliBreathworkConfig =>
        e.exerciseTypeId === "breathwork-farinelli",
    );
    const maxCounts = farinelliExercises.map((e) => e.maxCount);
    const minCount = 4;
    const maxCount = Math.max(...maxCounts);

    const segments: VoiceSegment[] = [
      {
        name: "countdown",
        ssml: "<speak>Let's exhale all the air out. <break time=\"2s\"/> Three. <break time=\"1s\"/> Two. <break time=\"1s\"/> One.</speak>",
      },
    ];

    for (let n = minCount; n <= maxCount; n++) {
      segments.push({
        name: `inhale-${n}`,
        ssml: `<speak>Inhale. <break time="1s"/> ${ExerciseTypeVoiceConfig.countSequence(n)}</speak>`,
      });
      segments.push({
        name: `hold-${n}`,
        ssml: `<speak>Hold. <break time="1s"/> ${ExerciseTypeVoiceConfig.countSequence(n)}</speak>`,
      });
    }

    segments.push({
      name: "exhale-8",
      ssml: `<speak>Exhale. <break time="1s"/> ${ExerciseTypeVoiceConfig.countSequence(8)}</speak>`,
    });

    // Tips — spoken by Riley voice
    FARINELLI_TIPS.forEach((tip, i) => {
      segments.push({
        name: `tip-${i + 1}`,
        ssml: `<speak>${tip}</speak>`,
        voice: "tips",
      });
    });

    return segments;
  }
}

// ── Learn Voice-Driven ──────────────────────────────────────────────────────

class LearnVoiceDrivenVoiceConfig extends ExerciseTypeVoiceConfig {
  readonly exerciseTypeId = "learn-voice-driven";

  /** Generate segments for a specific exercise by slug. */
  segmentsForSlug(slug: string): VoiceSegment[] {
    const exercise = journey.exercises.find(
      (e): e is LearnVoiceDrivenConfig =>
        e.exerciseTypeId === "learn-voice-driven" && e.slug === slug,
    );
    if (!exercise) throw new Error(`No learn-voice-driven exercise with slug "${slug}"`);

    return exercise.segments.map((s) => ({
      name: s.name,
      ssml: `<speak>${s.text}</speak>`,
    }));
  }

  /** Returns segments for all learn-voice-driven exercises. */
  segments(): VoiceSegment[] {
    const exercises = journey.exercises.filter(
      (e): e is LearnVoiceDrivenConfig =>
        e.exerciseTypeId === "learn-voice-driven",
    );

    return exercises.flatMap((ex) =>
      ex.segments.map((s) => ({
        name: s.name,
        ssml: `<speak>${s.text}</speak>`,
      })),
    );
  }
}

// ── Registry ─────────────────────────────────────────────────────────────────

const configs: ExerciseTypeVoiceConfig[] = [
  new FarinelliVoiceConfig(),
  new LearnVoiceDrivenVoiceConfig(),
];

export function getExerciseTypeVoiceConfig(
  exerciseTypeId: string,
): ExerciseTypeVoiceConfig {
  const config = configs.find((c) => c.exerciseTypeId === exerciseTypeId);
  if (!config)
    throw new Error(`No voice config for exercise type "${exerciseTypeId}"`);
  return config;
}
