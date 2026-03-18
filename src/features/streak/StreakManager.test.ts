import { describe, it, expect, beforeEach, vi } from "vitest";
import { StreakManager } from "./StreakManager";

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  length: 0,
  key: () => null,
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
  vi.restoreAllMocks();
});

function setDate(dateStr: string) {
  vi.setSystemTime(new Date(`${dateStr}T12:00:00`));
}

describe("StreakManager", () => {
  it("starts with zero streak when nothing stored", () => {
    const sm = new StreakManager();
    expect(sm.getData().currentStreak).toBe(0);
    expect(sm.getData().longestStreak).toBe(0);
    expect(sm.getData().lastCompletedAt).toBe("");
  });

  it("first completion sets streak to 1", () => {
    vi.useFakeTimers();
    setDate("2026-03-18");

    const sm = new StreakManager();
    const result = sm.recordCompletion();

    expect(result).toEqual({ changed: true, streak: 1 });
    expect(sm.getData().currentStreak).toBe(1);
    expect(sm.getData().lastCompletedAt).toBeTruthy();

    vi.useRealTimers();
  });

  it("same day completion is a no-op", () => {
    vi.useFakeTimers();
    setDate("2026-03-18");

    const sm = new StreakManager();
    sm.recordCompletion();
    const result = sm.recordCompletion();

    expect(result).toEqual({ changed: false, streak: 1 });
    expect(sm.getData().currentStreak).toBe(1);

    vi.useRealTimers();
  });

  it("next day increments streak", () => {
    vi.useFakeTimers();
    setDate("2026-03-18");

    const sm = new StreakManager();
    sm.recordCompletion();

    setDate("2026-03-19");
    const result = sm.recordCompletion();

    expect(result).toEqual({ changed: true, streak: 2 });
    expect(sm.getData().currentStreak).toBe(2);

    vi.useRealTimers();
  });

  it("gap of 2+ days resets streak to 1", () => {
    vi.useFakeTimers();
    setDate("2026-03-18");

    const sm = new StreakManager();
    sm.recordCompletion();

    setDate("2026-03-21"); // 3 days later
    const result = sm.recordCompletion();

    expect(result).toEqual({ changed: true, streak: 1 });
    expect(sm.getData().currentStreak).toBe(1);

    vi.useRealTimers();
  });

  it("tracks longest streak", () => {
    vi.useFakeTimers();
    setDate("2026-03-18");

    const sm = new StreakManager();
    sm.recordCompletion(); // streak: 1
    setDate("2026-03-19");
    sm.recordCompletion(); // streak: 2
    setDate("2026-03-20");
    sm.recordCompletion(); // streak: 3

    expect(sm.getData().longestStreak).toBe(3);

    // Break the streak
    setDate("2026-03-25");
    sm.recordCompletion(); // streak: 1

    expect(sm.getData().currentStreak).toBe(1);
    expect(sm.getData().longestStreak).toBe(3); // preserved

    vi.useRealTimers();
  });

  it("persists to localStorage", () => {
    vi.useFakeTimers();
    setDate("2026-03-18");

    const sm = new StreakManager();
    sm.recordCompletion();

    const raw = JSON.parse(localStorage.getItem("attunr.streak")!);
    expect(raw.currentStreak).toBe(1);
    expect(raw.lastCompletedAt).toBeTruthy();

    vi.useRealTimers();
  });

  it("loads existing data from localStorage", () => {
    localStorage.setItem("attunr.streak", JSON.stringify({
      currentStreak: 5,
      longestStreak: 10,
      lastCompletedAt: "2026-03-17T12:00:00.000Z",
    }));

    const sm = new StreakManager();
    expect(sm.getData().currentStreak).toBe(5);
    expect(sm.getData().longestStreak).toBe(10);
  });

  it("handles corrupt localStorage gracefully", () => {
    localStorage.setItem("attunr.streak", "not-json!!!");
    const sm = new StreakManager();
    expect(sm.getData().currentStreak).toBe(0);
  });

  it("handles missing fields gracefully", () => {
    localStorage.setItem("attunr.streak", JSON.stringify({ currentStreak: 3 }));
    const sm = new StreakManager();
    expect(sm.getData().currentStreak).toBe(3);
    expect(sm.getData().longestStreak).toBe(0);
    expect(sm.getData().lastCompletedAt).toBe("");
  });
});
