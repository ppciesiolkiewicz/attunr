const STORAGE_KEY = "attunr.streak";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedAt: string; // ISO 8601 timestamp, "" if never
}

export interface StreakResult {
  changed: boolean;
  streak: number;
}

const DEFAULT_DATA: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastCompletedAt: "",
};

/** Extract local calendar date as "YYYY-MM-DD" from a Date. */
function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export class StreakManager {
  private data: StreakData;

  constructor() {
    this.data = StreakManager.load();
  }

  getData(): StreakData {
    return { ...this.data };
  }

  recordCompletion(): StreakResult {
    const today = toLocalDateString(new Date());

    if (this.data.lastCompletedAt) {
      const lastDate = toLocalDateString(new Date(this.data.lastCompletedAt));

      if (lastDate === today) {
        return { changed: false, streak: this.data.currentStreak };
      }

      const now = new Date();
      now.setDate(now.getDate() - 1);
      const yesterday = toLocalDateString(now);

      if (lastDate === yesterday) {
        this.data.currentStreak += 1;
      } else {
        this.data.currentStreak = 1;
      }
    } else {
      this.data.currentStreak = 1;
    }

    this.data.lastCompletedAt = new Date().toISOString();
    this.data.longestStreak = Math.max(
      this.data.currentStreak,
      this.data.longestStreak,
    );
    this.persist();

    return { changed: true, streak: this.data.currentStreak };
  }

  // ── Persistence ──────────────────────────────────────────────────────

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // localStorage unavailable
    }
  }

  private static load(): StreakData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_DATA };
      const parsed = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        return { ...DEFAULT_DATA };
      }
      return {
        currentStreak: typeof parsed.currentStreak === "number" ? parsed.currentStreak : 0,
        longestStreak: typeof parsed.longestStreak === "number" ? parsed.longestStreak : 0,
        lastCompletedAt: typeof parsed.lastCompletedAt === "string" ? parsed.lastCompletedAt : "",
      };
    } catch {
      return { ...DEFAULT_DATA };
    }
  }
}
