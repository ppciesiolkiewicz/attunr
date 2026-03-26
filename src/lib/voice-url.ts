/**
 * Bump this after uploading new audio to force clients to re-download.
 * Appended as `?v=<version>` to all voice audio/timestamp URLs.
 */
const AUDIO_VERSION = "v1";

const BASE = process.env.NEXT_PUBLIC_VOICE_BASE_URL ?? "";

/** Build a versioned voice asset URL. */
export function voiceUrl(path: string): string {
  return `${BASE}/${path}?${AUDIO_VERSION}`;
}
