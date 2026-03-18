import { describe, it, expect, beforeEach } from "vitest";
import { JourneyProgress } from "./journey-progress";

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
});

describe("JourneyProgress", () => {
  it("starts empty when nothing in localStorage", () => {
    const p = new JourneyProgress();
    expect(p.getAll()).toEqual({});
  });

  it("completeExercise creates nested structure and persists", () => {
    const p = new JourneyProgress();
    p.completeExercise("introduction", "wake-up", "gentle-hum");

    expect(p.isCompleted("introduction", "wake-up", "gentle-hum")).toBe(true);
    expect(p.isCompleted("introduction", "wake-up", "low-uu")).toBe(false);

    const raw = JSON.parse(localStorage.getItem("attunr.journeyProgress")!);
    expect(raw).toEqual({
      introduction: {
        "wake-up": {
          "gentle-hum": { completed: true, completedAt: expect.any(Number) },
        },
      },
    });
  });

  it("loads existing progress from localStorage", () => {
    localStorage.setItem(
      "attunr.journeyProgress",
      JSON.stringify({
        introduction: {
          "wake-up": {
            "gentle-hum": { completed: true },
            "low-uu": { completed: false },
          },
        },
      }),
    );

    const p = new JourneyProgress();
    expect(p.isCompleted("introduction", "wake-up", "gentle-hum")).toBe(true);
    expect(p.isCompleted("introduction", "wake-up", "low-uu")).toBe(false);
  });

  it("isStageCompleted returns true when all exercises done", () => {
    const p = new JourneyProgress();
    p.completeExercise("introduction", "wake-up", "gentle-hum");
    p.completeExercise("introduction", "wake-up", "low-uu");

    expect(p.isStageCompleted("introduction", "wake-up")).toBe(true);
  });

  it("isStageCompleted returns false when any exercise incomplete", () => {
    const p = new JourneyProgress();
    p.completeExercise("introduction", "wake-up", "gentle-hum");
    p.completeExercise("introduction", "wake-up", "low-uu");
    p.resetExercise("introduction", "wake-up", "low-uu");

    expect(p.isStageCompleted("introduction", "wake-up")).toBe(false);
  });

  it("isChapterCompleted returns true only when all stages complete", () => {
    const p = new JourneyProgress();
    p.completeExercise("introduction", "wake-up", "gentle-hum");
    expect(p.isChapterCompleted("introduction")).toBe(true);

    // Add incomplete exercise to another stage
    p.completeExercise("introduction", "first-sounds", "lip-roll");
    p.resetExercise("introduction", "first-sounds", "lip-roll");
    expect(p.isChapterCompleted("introduction")).toBe(false);
  });

  it("resetExercise sets completed to false", () => {
    const p = new JourneyProgress();
    p.completeExercise("introduction", "wake-up", "gentle-hum");
    expect(p.isCompleted("introduction", "wake-up", "gentle-hum")).toBe(true);

    p.resetExercise("introduction", "wake-up", "gentle-hum");
    expect(p.isCompleted("introduction", "wake-up", "gentle-hum")).toBe(false);
  });

  it("resetChapter removes the chapter entirely", () => {
    const p = new JourneyProgress();
    p.completeExercise("introduction", "wake-up", "gentle-hum");
    p.completeExercise("introduction", "wake-up", "low-uu");
    p.completeExercise("introduction", "first-sounds", "lip-roll");

    p.resetChapter("introduction");

    expect(p.isCompleted("introduction", "wake-up", "gentle-hum")).toBe(false);
    expect(p.isCompleted("introduction", "first-sounds", "lip-roll")).toBe(false);
    expect(p.getAll().introduction).toBeUndefined();
  });

  it("resetAll clears everything", () => {
    const p = new JourneyProgress();
    p.completeExercise("introduction", "wake-up", "gentle-hum");
    p.completeExercise("building-foundation", "finding-range", "hum-low");

    p.resetAll();

    expect(p.getAll()).toEqual({});
    expect(localStorage.getItem("attunr.journeyProgress")).toBe("{}");
  });

  it("reload picks up external localStorage changes", () => {
    const p = new JourneyProgress();
    expect(p.isCompleted("introduction", "wake-up", "gentle-hum")).toBe(false);

    localStorage.setItem(
      "attunr.journeyProgress",
      JSON.stringify({
        introduction: { "wake-up": { "gentle-hum": { completed: true } } },
      }),
    );

    p.reload();
    expect(p.isCompleted("introduction", "wake-up", "gentle-hum")).toBe(true);
  });

  it("handles corrupt localStorage gracefully", () => {
    localStorage.setItem("attunr.journeyProgress", "not-json!!!");
    const p = new JourneyProgress();
    expect(p.getAll()).toEqual({});
  });

  it("handles array localStorage gracefully", () => {
    localStorage.setItem("attunr.journeyProgress", "[1,2,3]");
    const p = new JourneyProgress();
    expect(p.getAll()).toEqual({});
  });

  it("does not duplicate on repeated completeExercise calls", () => {
    const p = new JourneyProgress();
    p.completeExercise("introduction", "wake-up", "gentle-hum");
    p.completeExercise("introduction", "wake-up", "gentle-hum");

    expect(Object.keys(p.getAll().introduction!["wake-up"]!)).toHaveLength(1);
  });

  it("get returns undefined for unknown paths", () => {
    const p = new JourneyProgress();
    expect(p.get("nope", "nope", "nope")).toBeUndefined();
  });

  it("resetExercise is a no-op for unknown paths", () => {
    const p = new JourneyProgress();
    p.resetExercise("nope", "nope", "nope");
    expect(p.getAll()).toEqual({});
  });

  it("path-based set creates deeply nested structure in one call", () => {
    const p = new JourneyProgress();
    p.set(["ch1", "stage-a", "ex-1"], { completed: true });
    p.set(["ch1", "stage-a", "ex-2"], { completed: false });
    p.set(["ch1", "stage-b", "ex-3"], { completed: true });

    expect(p.get("ch1", "stage-a", "ex-1")).toEqual({ completed: true });
    expect(p.get("ch1", "stage-a", "ex-2")).toEqual({ completed: false });
    expect(p.get("ch1", "stage-b", "ex-3")).toEqual({ completed: true });
  });
});
