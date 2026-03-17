import { hzToMidi, midiToHz, hzToNoteName, NOTE_NAMES } from "@/lib/pitch";
import { parseRgb, lerpColor, toHex } from "@/lib/color";
import type { TuningStandard } from "@/constants/tuning";

// ── Note types ──────────────────────────────────────────────────────────────

/** A resolved note from a scale — physical properties without visual styling. */
export interface ResolvedNote {
  id: string;
  midi: number;
  frequencyHz: number;
  note: string;
  octave: number;
  name: string;
}

/** A resolved note with color from the user's vocal range. */
export interface ColoredNote extends ResolvedNote {
  color: string;
  /** Comma-separated RGB for rgba() usage. */
  rgb: string;
}

/** 7-color palette for note visualization across the vocal range. */
export const NOTE_PALETTE = [
  { color: "#ef4444", rgb: "239, 68, 68" },
  { color: "#f97316", rgb: "249, 115, 22" },
  { color: "#eab308", rgb: "234, 179, 8" },
  { color: "#22c55e", rgb: "34, 197, 94" },
  { color: "#3b82f6", rgb: "59, 130, 246" },
  { color: "#6366f1", rgb: "99, 102, 241" },
  { color: "#a855f7", rgb: "168, 85, 247" },
];

// ── VocalRange class ────────────────────────────────────────────────────────

export class VocalRange {
  readonly lowNote: string;
  readonly highNote: string;
  readonly allNotes: ColoredNote[];

  constructor(lowHz: number, highHz: number, _tuning: TuningStandard) {
    this.lowNote = hzToNoteName(lowHz);
    this.highNote = hzToNoteName(highHz);
    this.allNotes = this.colorize(lowHz, highHz);
  }

  /**
   * Find the closest note by MIDI number.
   * Returns an exact match if one exists, otherwise the nearest note in range.
   */
  findNote(midi: number): ColoredNote | null {
    const exact = this.allNotes.find((n) => n.midi === midi);
    if (exact) return exact;
    if (this.allNotes.length === 0) return null;

    let closest = this.allNotes[0];
    let minDist = Math.abs(midi - closest.midi);
    for (let i = 1; i < this.allNotes.length; i++) {
      const dist = Math.abs(midi - this.allNotes[i].midi);
      if (dist < minDist) {
        closest = this.allNotes[i];
        minDist = dist;
      }
    }
    return closest;
  }

  // ── Private ─────────────────────────────────────────────────────────────

  /**
   * Build the chromatic color spectrum for the vocal range.
   *
   * Every semitone from lowHz to highHz gets a smoothly interpolated color
   * from the 7-color NOTE_PALETTE. This means any note (regardless of scale)
   * can look up its color by MIDI — C4 always has the same color for a given
   * user regardless of which exercise uses it.
   */
  private colorize(lowHz: number, highHz: number): ColoredNote[] {
    const lowMidi = Math.round(hzToMidi(lowHz));
    const highMidi = Math.round(hzToMidi(highHz));

    const allMidi: number[] = [];
    for (let midi = lowMidi; midi <= highMidi; midi++) {
      allMidi.push(midi);
    }

    if (allMidi.length === 0) return [];

    const n = allMidi.length;

    // 7 evenly-spaced anchor points for color interpolation
    const anchorIndices: number[] = Array.from({ length: 7 }, (_, i) =>
      n <= 7 ? i : Math.round((i * (n - 1)) / 6),
    );

    const anchorRgbs = NOTE_PALETTE.map((p) => parseRgb(p.rgb));

    function colorAt(idx: number): { hex: string; rgb: string } {
      if (idx <= anchorIndices[0]) {
        const [r, g, b] = anchorRgbs[0];
        return { hex: toHex(r, g, b), rgb: `${r}, ${g}, ${b}` };
      }
      if (idx >= anchorIndices[6]) {
        const [r, g, b] = anchorRgbs[6];
        return { hex: toHex(r, g, b), rgb: `${r}, ${g}, ${b}` };
      }
      for (let s = 0; s < 6; s++) {
        if (idx >= anchorIndices[s] && idx <= anchorIndices[s + 1]) {
          const span = anchorIndices[s + 1] - anchorIndices[s];
          const t = span === 0 ? 0 : (idx - anchorIndices[s]) / span;
          const [r, g, b] = lerpColor(anchorRgbs[s], anchorRgbs[s + 1], t);
          return { hex: toHex(r, g, b), rgb: `${r}, ${g}, ${b}` };
        }
      }
      const [r, g, b] = anchorRgbs[0];
      return { hex: toHex(r, g, b), rgb: `${r}, ${g}, ${b}` };
    }

    return allMidi.map((midi, idx) => {
      const hz = Math.round(midiToHz(midi));
      const noteName = NOTE_NAMES[((midi % 12) + 12) % 12];
      const octave = Math.floor(midi / 12) - 1;
      const { hex, rgb } = colorAt(idx);
      return {
        id: `${noteName}${octave}`,
        midi,
        frequencyHz: hz,
        note: noteName,
        octave,
        color: hex,
        rgb,
        name: `${noteName}${octave}`,
      };
    });
  }
}
