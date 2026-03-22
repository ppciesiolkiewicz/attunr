export interface VoiceProfile {
  name: string;
  voiceId: string;
  speed?: number;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  speakerBoost?: boolean;
}

type VoiceOverrides = Partial<Omit<VoiceProfile, "name" | "voiceId">>;

// ── Voice profile defaults ──────────────────────────────────────────────────

const RILEY_DEFAULTS: VoiceProfile = {
  name: "Riley",
  voiceId: "hA4zGnmTwX2NQiTRMt7o",
  speed: 0.8,
  stability: 0.12,
  similarityBoost: 0.75,
  style: 0.94,
  speakerBoost: true,
};

const AUSTRALIAN_BARITONE_DEFAULTS: VoiceProfile = {
  name: "Australian Baritone",
  voiceId: "KmnvDXRA0HU55Q0aqkPG",
};

// ── Factory functions ───────────────────────────────────────────────────────

/** Riley voice with optional overrides. */
export function riley(overrides?: VoiceOverrides): VoiceProfile {
  return { ...RILEY_DEFAULTS, ...overrides };
}

/** Australian Baritone voice with optional overrides. */
export function australianBaritone(overrides?: VoiceOverrides): VoiceProfile {
  return { ...AUSTRALIAN_BARITONE_DEFAULTS, ...overrides };
}

// ── Global settings ─────────────────────────────────────────────────────────

export const voiceSettings = {
  /** ElevenLabs model to use. Must support SSML break tags (not v3). */
  modelId: "eleven_multilingual_v2",
  /** Language code for multilingual models. */
  languageCode: "en",
};
