import { resolveExercise } from "./exercise-resolver";
import type { Exercise } from "./exercise-resolver";
import type { VocalRange } from "@/lib/VocalRange";
import type { ExerciseConfig, Chapter, ChapterInput, StageConfigInput } from "./types";

export class Journey {
  readonly chapters: Chapter[];
  readonly exercises: ExerciseConfig[];

  constructor(chapters: ChapterInput[]) {
    this.chapters = this.assignIds(chapters);
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


  /** Get all exercises in a chapter as a flat array (warmup + stages). */
  getChapterExercises(chapterNum: number): ExerciseConfig[] {
    const chapter = this.chapters.find((ch) => ch.chapter === chapterNum);
    if (!chapter) return [];
    const stages = chapter.warmup ? [chapter.warmup, ...chapter.stages] : chapter.stages;
    return stages.flatMap((s) => s.exercises);
  }

  // ── Slug-based lookups ─────────────────────────────────────────────────

  /** Find a chapter by its slug. */
  getChapterBySlug(slug: string): Chapter | undefined {
    return this.chapters.find((ch) => ch.slug === slug);
  }

  /** Find an exercise by its slug (globally unique). */
  getExerciseBySlug(slug: string): ExerciseConfig | undefined {
    return this.exercises.find((e) => e.slug === slug);
  }

  /** Find an exercise by chapter slug + exercise slug. */
  getExerciseByRoute(chapterSlug: string, exerciseSlug: string): ExerciseConfig | undefined {
    return this.exercises.find(
      (e) => e.chapterSlug === chapterSlug && e.slug === exerciseSlug,
    );
  }

  /** Build the URL path for an exercise. */
  exerciseHref(exercise: ExerciseConfig): string {
    return `/journey/${exercise.chapterSlug}/${exercise.slug}`;
  }

  /** Build the URL path for a chapter. */
  chapterHref(chapter: Chapter): string {
    return `/journey/${chapter.slug}`;
  }

  /** Get the next exercise after the given one. */
  getNextExercise(exercise: ExerciseConfig): ExerciseConfig | null {
    const idx = this.exercises.findIndex((e) => e.id === exercise.id);
    return idx >= 0 && idx < this.exercises.length - 1
      ? this.exercises[idx + 1]
      : null;
  }

  /** Get the previous exercise before the given one. */
  getPrevExercise(exercise: ExerciseConfig): ExerciseConfig | null {
    const idx = this.exercises.findIndex((e) => e.id === exercise.id);
    return idx > 0 ? this.exercises[idx - 1] : null;
  }

  /** Assign sequential IDs, chapter, chapterSlug, and stageId to all exercises. */
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
            chapterSlug: ch.slug,
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

}
