export type PracticeFrequency = "daily" | "every-other-day" | "3x-week" | "weekly";

export const FREQUENCY_OPTIONS: readonly {
  id: PracticeFrequency;
  label: string;
  description: string;
}[] = [
  { id: "daily", label: "Every day", description: "Build a daily habit" },
  { id: "every-other-day", label: "Every other day", description: "Gentle consistency" },
  { id: "3x-week", label: "3 times a week", description: "Balanced routine" },
  { id: "weekly", label: "Once a week", description: "Easy start" },
] as const;

/** Milliseconds between reminders for each frequency. */
export const FREQUENCY_MS: Record<PracticeFrequency, number> = {
  daily: 24 * 60 * 60 * 1000,
  "every-other-day": 2 * 24 * 60 * 60 * 1000,
  "3x-week": 2.33 * 24 * 60 * 60 * 1000, // ~56 hours
  weekly: 7 * 24 * 60 * 60 * 1000,
};
