import { AUDIO_VERSION } from "@/constants/settings";

const BASE = process.env.NEXT_PUBLIC_VOICE_BASE_URL ?? "";

/** Build a versioned voice asset URL. */
export function voiceUrl(path: string): string {
  return `${BASE}/${path}?${AUDIO_VERSION}`;
}
