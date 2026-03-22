import { journey } from "../../src/constants/journey";
import type { FarinelliBreathworkConfig } from "../../src/constants/journey";

export interface VoiceSegment {
  name: string;
  ssml: string;
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

    return segments;
  }
}

// ── Registry ─────────────────────────────────────────────────────────────────

const configs: ExerciseTypeVoiceConfig[] = [new FarinelliVoiceConfig()];

export function getExerciseTypeVoiceConfig(
  exerciseTypeId: string,
): ExerciseTypeVoiceConfig {
  const config = configs.find((c) => c.exerciseTypeId === exerciseTypeId);
  if (!config)
    throw new Error(`No voice config for exercise type "${exerciseTypeId}"`);
  return config;
}
