export type TuningStandard = "A432" | "A440" | "A444" | "A528";

export const TUNING_OPTIONS: {
  id: TuningStandard;
  label: string;
  description: string;
}[] = [
  { id: "A432", label: "A432 Hz", description: "Softer, warmer — healing-focused practice" },
  { id: "A440", label: "A440 Hz", description: "Standard Western tuning" },
  { id: "A444", label: "A444 Hz", description: "Natural tuning, sacred music traditions" },
  { id: "A528", label: "A528 Hz", description: '"Miracle tone" — popular in sound healing' },
];

export const TUNING_A_HZ: Record<TuningStandard, number> = {
  A432: 432,
  A440: 440,
  A444: 444,
  A528: 528,
};

export type FrequencyBase = "absolute" | "voice";
