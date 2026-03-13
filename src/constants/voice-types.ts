export type VoiceTypeId = "bass" | "baritone" | "tenor" | "alto" | "soprano";

export interface VoiceType {
  id: VoiceTypeId;
  label: string;
  rangeHz: [number, number];
}

export const VOICE_TYPES: VoiceType[] = [
  { id: "bass",     label: "Bass",     rangeHz: [82, 330] },
  { id: "baritone", label: "Baritone", rangeHz: [98, 392] },
  { id: "tenor",    label: "Tenor",    rangeHz: [131, 523] },
  { id: "alto",     label: "Alto",     rangeHz: [175, 698] },
  { id: "soprano",  label: "Soprano",  rangeHz: [262, 1047] },
];
