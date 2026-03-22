// scripts/voice-instruction-settings.ts

interface VoiceProfile {
  name: string;
  voiceId: string;
  speed?: number;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  speakerBoost?: boolean;
}

// ── Voice profiles ───────────────────────────────────────────────────────────

const VOICE_RILEY: VoiceProfile = {
  name: "Riley",
  voiceId: "hA4zGnmTwX2NQiTRMt7o",
  speed: 0.8,
  stability: 0.12,
  similarityBoost: 0.75,
  style: 0.94,
  speakerBoost: true,
};

const VOICE_AUSTRALIAN_BARITONE: VoiceProfile = {
  name: "Australian Baritone",
  voiceId: "KmnvDXRA0HU55Q0aqkPG",
};

// ── Settings ─────────────────────────────────────────────────────────────────

export const voiceSettings = {
  instructionVoice: VOICE_AUSTRALIAN_BARITONE,
  tipsVoice: VOICE_RILEY,
  /** ElevenLabs model to use. Must support SSML break tags (not v3). */
  modelId: "eleven_multilingual_v2",
  /** Language code for multilingual models. */
  languageCode: "en",
};
