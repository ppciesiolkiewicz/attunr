import { journey } from "../../src/constants/journey";
import type { FarinelliBreathworkConfig, FarinelliVoiceDrivenConfig, LearnVoiceDrivenConfig } from "../../src/constants/journey";
import { FARINELLI_SPOKEN_TIPS } from "../../src/constants/farinelli-tips";
import { type VoiceProfile, riley, australianBaritone } from "./settings";

export interface VoiceSegment {
  name: string;
  ssml: string;
  /** Voice profile for this segment. Defaults to australianBaritone(). */
  voice?: VoiceProfile;
}

// ── Base class ───────────────────────────────────────────────────────────────

export abstract class ExerciseTypeVoiceConfig {
  abstract readonly exerciseTypeId: string;
  abstract segments(): VoiceSegment[];

  static countSequence(n: number): string {
    return Array.from({ length: n }, (_, i) => `${i + 1}`).join(". ") + ".";
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
    const voiceDrivenExercises = journey.exercises.filter(
      (e): e is FarinelliVoiceDrivenConfig =>
        e.exerciseTypeId === "farinelli-voice-driven",
    );
    const allMaxCounts = [
      ...farinelliExercises.map((e) => e.maxCount),
      ...voiceDrivenExercises.map((e) => e.maxCount),
    ];
    const allMinCounts = voiceDrivenExercises.map((e) => e.minCount);
    const minCount = allMinCounts.length > 0 ? Math.min(...allMinCounts) : 4;
    const maxCount = Math.max(...allMaxCounts);

    const segments: VoiceSegment[] = [
      {
        name: "countdown",
        ssml: "Let's exhale all the air out. Three. Two. One.",
        voice: australianBaritone({ speed: 0.73 }),
      },
    ];

    for (let n = minCount; n <= maxCount; n++) {
      segments.push({
        name: `inhale-${n}`,
        ssml: `Inhale. ${ExerciseTypeVoiceConfig.countSequence(n)}`,
        voice: australianBaritone({ speed: 0.73 }),
      });
      segments.push({
        name: `hold-${n}`,
        ssml: `Hold. ${ExerciseTypeVoiceConfig.countSequence(n)}`,
        voice: australianBaritone({ speed: 0.73 }),
      });
      segments.push({
        name: `exhale-${n}`,
        ssml: `Exhale. ${ExerciseTypeVoiceConfig.countSequence(n)}`,
        voice: australianBaritone({ speed: 0.73 }),
      });
    }

    // Tips — spoken by Riley voice
    FARINELLI_SPOKEN_TIPS.forEach((tip, i) => {
      segments.push({
        name: `tip-${i + 1}`,
        ssml: tip,
        voice: riley(),
      });
    });

    return segments;
  }
}

// ── Learn Voice-Driven ──────────────────────────────────────────────────────

class LearnVoiceDrivenVoiceConfig extends ExerciseTypeVoiceConfig {
  readonly exerciseTypeId = "learn-voice-driven";

  /** Generate segments for a specific exercise by slug. Only segments with spokenText. */
  segmentsForSlug(slug: string): VoiceSegment[] {
    const exercise = journey.exercises.find(
      (e): e is LearnVoiceDrivenConfig =>
        e.exerciseTypeId === "learn-voice-driven" && e.slug === slug,
    );
    if (!exercise) throw new Error(`No learn-voice-driven exercise with slug "${slug}"`);

    return exercise.segments
      .filter((s) => s.spokenText)
      .map((s) => ({
        name: s.name,
        ssml: s.spokenText!,
        voice: australianBaritone(),
      }));
  }

  /** Returns segments for all learn-voice-driven exercises. Only segments with spokenText. */
  segments(): VoiceSegment[] {
    const exercises = journey.exercises.filter(
      (e): e is LearnVoiceDrivenConfig =>
        e.exerciseTypeId === "learn-voice-driven",
    );

    return exercises.flatMap((ex) =>
      ex.segments
        .filter((s) => s.spokenText)
        .map((s) => ({
          name: s.name,
          ssml: s.spokenText!,
          voice: australianBaritone(),
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
