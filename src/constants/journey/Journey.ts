import { resolveExercise } from "@/lib/resolve-exercise";
import type { Exercise } from "@/lib/resolve-exercise";
import type { VocalRange } from "@/lib/VocalRange";
import type { ExerciseConfig, Chapter, ChapterInput, StageConfigInput, ModalConfig, ContentElement } from "./types";
import { FARINELLI_TIPS } from "@/constants/farinelli-tips";

export class Journey {
  readonly chapters: Chapter[];
  readonly exercises: ExerciseConfig[];

  constructor(chapters: ChapterInput[]) {
    this.chapters = this.withIntroModals(this.assignIds(chapters));
    this.exercises = this.chapters.flatMap((ch) => {
      const stages = ch.warmup ? [ch.warmup, ...ch.stages] : ch.stages;
      return stages.flatMap((s) => s.exercises);
    });
  }

  getExercise(id: number, vocalRange: VocalRange): Exercise {
    const config = this.exercises.find((e) => e.id === id);
    if (!config) throw new Error(`Exercise ${id} not found`);
    return resolveExercise(config, vocalRange);
  }

  getNextExerciseId(currentId: number): number | null {
    const idx = this.exercises.findIndex((e) => e.id === currentId);
    return idx >= 0 && idx < this.exercises.length - 1
      ? this.exercises[idx + 1].id
      : null;
  }

  /** Assign sequential IDs (1-based), chapter, and stageId to all exercises across all chapters. */
  private assignIds(chapters: ChapterInput[]): Chapter[] {
    let nextId = 1;
    return chapters.map((ch) => {
      function processStage(stage: StageConfigInput) {
        return {
          ...stage,
          exercises: stage.exercises.map((ex) => ({
            ...ex,
            id: nextId++,
            chapter: ch.chapter,
            stageId: stage.id,
          }) as ExerciseConfig),
        };
      }
      return {
        ...ch,
        warmup: ch.warmup ? processStage(ch.warmup) : undefined,
        stages: ch.stages.map(processStage),
      };
    });
  }

  /** Walk all exercises and generate introModal for non-learn exercises. */
  private withIntroModals(config: Chapter[]): Chapter[] {
    function processStage(stage: Chapter["stages"][number]) {
      return {
        ...stage,
        exercises: stage.exercises.map((ex) => {
          const introModal = Journey.buildIntroModal(ex);
          return introModal ? { ...ex, introModal } : ex;
        }),
      };
    }
    return config.map((ch) => ({
      ...ch,
      warmup: ch.warmup ? processStage(ch.warmup) : undefined,
      stages: ch.stages.map(processStage),
    }));
  }

  /** Build introModal for a non-learn exercise from its existing properties. */
  private static buildIntroModal(exercise: ExerciseConfig): ModalConfig | undefined {
    if (exercise.exerciseTypeId === "learn") return undefined;
    if (exercise.exerciseTypeId === "learn-notes-1") return undefined;
    if (exercise.introModal) return exercise.introModal;

    const elements: ContentElement[] = [];

    if (exercise.exerciseTypeId === "breathwork-farinelli") {
      elements.push({
        type: "warning",
        text: "If you have heart or respiratory conditions, or are pregnant, check with your doctor first. Stop immediately if you feel dizzy, lightheaded, or unwell at any time.",
      });
      elements.push({ type: "separator" });
      const firstParagraph = exercise.instruction.split("\n\n")[0];
      elements.push({ type: "paragraph", text: firstParagraph });
      elements.push({ type: "video" });
      elements.push({
        type: "tip-list",
        title: "Key tips",
        tips: [...FARINELLI_TIPS],
      });
      return {
        title: exercise.title,
        subtitle: `Complete ${exercise.maxCount} cycles — each a bit longer than the last`,
        elements,
      };
    }

    // Melody exercises — sing along to scrolling notes
    if (exercise.exerciseTypeId === "melody") {
      for (const line of exercise.instruction.split("\n")) {
        if (line.trim()) {
          elements.push({
            type: "paragraph",
            text: line,
            variant: elements.length === 0 ? undefined : "secondary",
          });
        }
      }
      elements.push({ type: "headphones-notice" });
      const noteCount = exercise.melody.flatMap((s) => s.events).filter((e) => e.type === "note").length;
      return {
        title: exercise.title,
        subtitle: `Sing along to ${noteCount} notes — score ${exercise.minScore}% to pass`,
        elements,
      };
    }

    // Tone-follow exercises — play and lip roll along
    if (exercise.exerciseTypeId === "tone-follow") {
      for (const line of exercise.instruction.split("\n")) {
        if (line.trim()) {
          elements.push({
            type: "paragraph",
            text: line,
            variant: elements.length === 0 ? undefined : "secondary",
          });
        }
      }
      elements.push({ type: "headphones-notice" });
      return {
        title: exercise.title,
        subtitle: `Play the tone ${exercise.requiredPlays} times and lip roll along`,
        elements,
      };
    }

    // Volume detection exercises — accumulate sound
    if (exercise.exerciseTypeId === "volume-detection") {
      for (const line of exercise.instruction.split("\n")) {
        if (line.trim()) {
          elements.push({
            type: "paragraph",
            text: line,
            variant: elements.length === 0 ? undefined : "secondary",
          });
        }
      }
      return {
        title: exercise.title,
        subtitle: `Make sound for ${exercise.targetSeconds} seconds`,
        elements,
      };
    }

    // Rhythm exercises — tap along with scoring
    if (exercise.exerciseTypeId === "rhythm") {
      for (const line of exercise.instruction.split("\n")) {
        if (line.trim()) {
          elements.push({
            type: "paragraph",
            text: line,
            variant: elements.length === 0 ? undefined : "secondary",
          });
        }
      }
      return {
        title: exercise.title,
        subtitle: `Tap along — score ${exercise.minScore}% to pass`,
        elements,
      };
    }

    // Hill pitch exercises (Low Uu, Hoo Hoo)
    if (exercise.exerciseTypeId === "pitch-detection-hill") {
      for (const line of exercise.instruction.split("\n")) {
        if (line.trim()) {
          elements.push({
            type: "paragraph",
            text: line,
            variant: elements.length === 0 ? undefined : "secondary",
          });
        }
      }
      const reps = exercise.notes.length;
      const secs = exercise.notes[0]?.seconds ?? 0;
      return {
        title: exercise.title,
        subtitle: `${secs}s × ${reps} reps`,
        elements,
      };
    }

    // Pitch exercises — instruction paragraphs
    for (const line of exercise.instruction.split("\n")) {
      if (line.trim()) {
        elements.push({
          type: "paragraph",
          text: line,
          variant: elements.length === 0 ? undefined : "secondary",
        });
      }
    }

    elements.push({ type: "headphones-notice" });

    // Compute subtitle from exercise shape
    let subtitle: string;
    if (exercise.exerciseTypeId === "pitch-detection-slide") {
      subtitle = "Slide smoothly through the range two or three times";
    } else if (exercise.notes.length > 1) {
      subtitle = `Sing each tone in sequence, ${exercise.notes[0]?.seconds ?? 0} seconds each`;
    } else {
      subtitle = `Hold the tone in tune for ${exercise.notes[0]?.seconds ?? 0} seconds`;
    }

    return { title: exercise.title, subtitle, elements };
  }
}
