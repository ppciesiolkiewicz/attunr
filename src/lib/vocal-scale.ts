import type { ColoredNote } from "@/constants/tone-slots";
import { NOTE_PALETTE } from "@/constants/tone-slots";
import { hzToMidi, midiToHz, NOTE_NAMES } from "@/lib/pitch";
import { parseRgb, lerpColor, toHex } from "@/lib/color";
import type { TuningStandard } from "@/constants/tuning";

/**
 * Build the chromatic color spectrum for a user's vocal range.
 *
 * Every semitone from lowHz to highHz gets a smoothly interpolated color
 * from the 7-color NOTE_PALETTE. This means any note (regardless of scale)
 * can look up its color by midi — C4 always has the same color for a given
 * user regardless of which exercise uses it.
 */
export function getScaleNotesForRange(
  lowHz: number,
  highHz: number,
  _tuning: TuningStandard,
): ColoredNote[] {
  const lowMidi = Math.round(hzToMidi(lowHz));
  const highMidi = Math.round(hzToMidi(highHz));

  // Build every chromatic semitone in range
  const allMidi: number[] = [];
  for (let midi = lowMidi; midi <= highMidi; midi++) {
    allMidi.push(midi);
  }

  if (allMidi.length === 0) return [];

  const n = allMidi.length;

  // 7 evenly-spaced anchor points for color interpolation
  const anchorIndices: number[] = Array.from({ length: 7 }, (_, i) =>
    n <= 7 ? i : Math.round((i * (n - 1)) / 6)
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
