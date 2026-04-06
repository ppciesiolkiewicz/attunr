// ── App Settings ─────────────────────────────────────────────────────────────
// Tuneable constants that affect the user experience. Centralised here so they
// are easy to find and adjust without digging through component files.

// ── Audio & Timing ───────────────────────────────────────────────────────────

/** Audio plays this many ms before the visual rectangle reaches the centre line. */
export const AUDIO_LEAD_MS = 50;

/** Visual lead-in before the first melody note (ms). */
export const PRE_ROLL_MS = 2000;

/** How far to rewind when pausing a melody exercise (ms). */
export const PAUSE_ROLLBACK_MS = 1000;

/** Binaural beat offset (Hz) — 6 Hz theta wave for calming/somatic effect. */
export const BINAURAL_BEAT_HZ = 6;

/** Master gain level for reference tone playback (0–1). */
export const TONE_GAIN = 0.42;

/** Default tone duration for reference tones (ms). */
export const TONE_DURATION_MS = 1800;

/** Tone envelope fade-in (seconds). */
export const TONE_FADE_IN_S = 0.02;

/** Tone envelope fade-out (seconds). */
export const TONE_FADE_OUT_S = 0.2;

// ── Pitch Detection ──────────────────────────────────────────────────────────

/** Minimum accepted voice frequency from CREPE (Hz). */
export const MIN_VOICE_HZ = 50;

/** Maximum accepted voice frequency from CREPE (Hz). */
export const MAX_VOICE_HZ = 2000;

/** Default pitch tolerance — ±3% ≈ ±50 cents. Pass a custom value for looser detection (e.g. lip rolls). */
export const PITCH_TOLERANCE = 0.03;

/** Range buffer for note band matching — ±10% at edges. */
export const NOTE_RANGE_BUFFER = 0.1;

/** RMS threshold below which audio is considered silence. */
export const SILENCE_THRESHOLD = 0.02;

// ── Scoring ──────────────────────────────────────────────────────────────────

/** Melody: fraction of note duration in-tune to classify as "hit". */
export const MELODY_HIT_THRESHOLD = 0.7;

/** Melody: fraction of note duration in-tune to classify as "close". */
export const MELODY_CLOSE_THRESHOLD = 0.4;

/** Rhythm: tap must land within ±ms of beat centre to be a "hit". */
export const RHYTHM_HIT_WINDOW_MS = 80;

/** Rhythm: tap must land within ±ms of beat centre to be "close". */
export const RHYTHM_CLOSE_WINDOW_MS = 150;

/** Rhythm: score multiplier for a "hit" tap. */
export const RHYTHM_HIT_WEIGHT = 1.0;

/** Rhythm: score multiplier for a "close" tap. */
export const RHYTHM_CLOSE_WEIGHT = 0.5;

/** Rhythm: ignore taps within this window of the previous tap (ms). */
export const RHYTHM_TAP_DEBOUNCE_MS = 50;

/** Rhythm: visual flash duration after a tap (ms). */
export const RHYTHM_TAP_FLASH_MS = 120;

// ── Canvas ───────────────────────────────────────────────────────────────────

/** Playhead / "now" position as fraction of canvas width (0.5 = centre). */
export const PLAYHEAD_X = 0.5;

/** Pitch trail dot capture interval (ms). */
export const DOT_INTERVAL_MS = 85;

/** Horizontal pixels between trail dots — also sets scroll speed (PX_PER_MS = DOT_SPACING_PX / DOT_INTERVAL_MS). */
export const DOT_SPACING_PX = 8;

/** Maximum trail dots to retain. */
export const MAX_TRAIL_DOTS = 90;

/** Volume sampling interval for volume-detection exercises (ms). ~30 fps. */
export const VOLUME_SAMPLE_INTERVAL_MS = 33;

// ── Voice ───────────────────────────────────────────────────────────────────

/** Bump after uploading new audio to force clients to re-download. Appended as `?v=<version>` to all voice asset URLs. */
export const AUDIO_VERSION = "v2";
