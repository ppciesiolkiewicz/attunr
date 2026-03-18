// ── Journey Progress Store ───────────────────────────────────────────────────
// Manages exercise completion state in localStorage as a single JSON blob.
// Structure: { [chapterSlug]: { [stageSlug]: { [exerciseSlug]: { completed } } } }

const STORAGE_KEY = "attunr.journeyProgress";

/** Stored state for a single exercise. */
export interface ExerciseProgress {
  completed: boolean;
}

/** The full persisted progress structure. */
export type JourneyProgressData = Record<
  string,
  Record<string, Record<string, ExerciseProgress>>
>;

/** Path to an exercise: [chapter, stage, exercise]. */
type ExercisePath = [chapter: string, stage: string, exercise: string];

export class JourneyProgress {
  private data: JourneyProgressData;

  constructor() {
    this.data = JourneyProgress.load();
  }

  // ── Path-based access ──────────────────────────────────────────────────

  /** Get exercise progress at path, or undefined if not tracked. */
  get(...[ch, st, ex]: ExercisePath): ExerciseProgress | undefined {
    return this.data[ch]?.[st]?.[ex];
  }

  /** Set exercise progress at path (creates intermediate objects if missing). */
  set([ch, st, ex]: ExercisePath, value: ExerciseProgress): void {
    ((this.data[ch] ??= {})[st] ??= {})[ex] = value;
    this.persist();
  }

  // ── Queries ────────────────────────────────────────────────────────────

  /** Check if a specific exercise is completed. */
  isCompleted(...path: ExercisePath): boolean {
    return this.get(...path)?.completed ?? false;
  }

  /** Check if all tracked exercises in a stage are completed. */
  isStageCompleted(chapterSlug: string, stageSlug: string): boolean {
    const exercises = this.data[chapterSlug]?.[stageSlug];
    if (!exercises) return false;
    const entries = Object.values(exercises);
    return entries.length > 0 && entries.every((ex) => ex.completed);
  }

  /** Check if all tracked stages in a chapter are completed. */
  isChapterCompleted(chapterSlug: string): boolean {
    const stages = this.data[chapterSlug];
    if (!stages) return false;
    const stageKeys = Object.keys(stages);
    return stageKeys.length > 0 && stageKeys.every((st) => this.isStageCompleted(chapterSlug, st));
  }

  /** Return the full progress data. */
  getAll(): JourneyProgressData {
    return this.data;
  }

  // ── Mutations ──────────────────────────────────────────────────────────

  /** Mark an exercise as completed. */
  completeExercise(...path: ExercisePath): void {
    this.set(path, { completed: true });
  }

  /** Reset an exercise back to incomplete. */
  resetExercise(...path: ExercisePath): void {
    if (this.get(...path)) {
      this.set(path, { completed: false });
    }
  }

  /** Reset all progress for a chapter. */
  resetChapter(chapterSlug: string): void {
    if (this.data[chapterSlug]) {
      delete this.data[chapterSlug];
      this.persist();
    }
  }

  /** Reset all progress. */
  resetAll(): void {
    this.data = {};
    this.persist();
  }

  // ── Persistence ────────────────────────────────────────────────────────

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // localStorage unavailable
    }
  }

  private static load(): JourneyProgressData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
      return parsed;
    } catch {
      return {};
    }
  }

  /** Force-reload from localStorage. */
  reload(): void {
    this.data = JourneyProgress.load();
  }
}
