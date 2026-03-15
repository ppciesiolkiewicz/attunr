import { Note, Scale } from "tonal";
import type { SlotId, Band } from "@/constants/tone-slots";
import { SLOTS, SLOT_ORDER } from "@/constants/tone-slots";
import { hzToMidi, midiToHz, NOTE_NAMES } from "@/lib/pitch";
import { parseRgb, lerpColor, toHex } from "@/lib/color";
import type { TuningStandard } from "@/constants/tuning";

/**
 * Build all major-scale MIDI notes spanning the user's detected vocal range.
 * Returns ALL notes — may be 7–20+ depending on range width.
 * If fewer than 7 fall in range, extends above highHz to reach 7.
 */
function buildScaleMidi(lowHz: number, highHz: number): number[] {
  const lowMidi = Math.round(hzToMidi(lowHz));
  const highMidi = Math.round(hzToMidi(highHz));

  const rootName = NOTE_NAMES[((lowMidi % 12) + 12) % 12];
  const scaleNotes = Scale.get(`${rootName} major`).notes;
  const scalePCs = new Set(scaleNotes.map((n) => Note.chroma(n) ?? -1));

  const allMidi: number[] = [];
  for (let midi = lowMidi; midi <= highMidi; midi++) {
    if (scalePCs.has(((midi % 12) + 12) % 12)) allMidi.push(midi);
  }

  // Extend above range if fewer than 7
  let ext = highMidi + 1;
  while (allMidi.length < 7 && ext < highMidi + 25) {
    if (scalePCs.has(((ext % 12) + 12) % 12)) allMidi.push(ext);
    ext++;
  }

  // Extreme fallback: chromatic steps
  if (allMidi.length === 0) {
    return Array.from({ length: 7 }, (_, i) =>
      lowMidi + Math.round((i * (highMidi - lowMidi)) / 6)
    );
  }

  return allMidi;
}

/**
 * Map the user's detected vocal range to all scale notes, with 7 evenly-spaced
 * slots and interpolated colors for the rest. Returns Band[] sorted low → high.
 */
export function getScaleNotesForRange(
  lowHz: number,
  highHz: number,
  _tuning: TuningStandard,
): Band[] {
  const allMidi = buildScaleMidi(lowHz, highHz);
  const n = allMidi.length;

  // Pick 7 evenly-spaced slot indices
  const slotIndices: number[] = Array.from({ length: 7 }, (_, i) =>
    n <= 7 ? i : Math.round((i * (n - 1)) / 6)
  );
  const slotIndexSet = new Set(slotIndices);

  // Parse slot RGB values once
  const slotRgbs = SLOT_ORDER.map((id) => {
    const slot = SLOTS.find((s) => s.id === id)!;
    return parseRgb(slot.rgb);
  });

  // Get interpolated color for any band index
  function colorAt(idx: number): { hex: string; rgb: string } {
    if (idx <= slotIndices[0]) {
      const [r, g, b] = slotRgbs[0];
      return { hex: toHex(r, g, b), rgb: `${r}, ${g}, ${b}` };
    }
    if (idx >= slotIndices[6]) {
      const [r, g, b] = slotRgbs[6];
      return { hex: toHex(r, g, b), rgb: `${r}, ${g}, ${b}` };
    }
    for (let s = 0; s < 6; s++) {
      if (idx >= slotIndices[s] && idx <= slotIndices[s + 1]) {
        const span = slotIndices[s + 1] - slotIndices[s];
        const t = span === 0 ? 0 : (idx - slotIndices[s]) / span;
        const [r, g, b] = lerpColor(slotRgbs[s], slotRgbs[s + 1], t);
        return { hex: toHex(r, g, b), rgb: `${r}, ${g}, ${b}` };
      }
    }
    const [r, g, b] = slotRgbs[0];
    return { hex: toHex(r, g, b), rgb: `${r}, ${g}, ${b}` };
  }

  return allMidi.map((midi, idx) => {
    const hz = Math.round(midiToHz(midi));
    const noteName = NOTE_NAMES[((midi % 12) + 12) % 12];
    const octave = Math.floor(midi / 12) - 1;

    if (slotIndexSet.has(idx)) {
      const slotNum = slotIndices.indexOf(idx);
      const slotId = SLOT_ORDER[slotNum];
      const slot = SLOTS.find((s) => s.id === slotId)!;
      return {
        id: slotId,
        midi,
        frequencyHz: hz,
        note: noteName,
        octave,
        color: slot.color,
        rgb: slot.rgb,
        name: slot.name,
        isSlot: true,
        slotId: slotId as SlotId,
      };
    }

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
      isSlot: false,
    };
  });
}

/**
 * Build all notes of a given scale type within a vocal range.
 * Used by melody exercises to create custom scale pools.
 */
export function buildScaleForRange(
  lowNote: string,
  highNote: string,
  scaleType: string,
  root: number,
): Band[] {
  const lowMidi = Note.midi(lowNote);
  const highMidi = Note.midi(highNote);
  if (lowMidi == null || highMidi == null) return [];

  const rootMidi = lowMidi + (root - 1);
  const rootName = NOTE_NAMES[((rootMidi % 12) + 12) % 12];
  const scaleNotes = Scale.get(`${rootName} ${scaleType}`).notes;
  const scalePCs = new Set(scaleNotes.map((n) => Note.chroma(n) ?? -1));

  const allMidi: number[] = [];
  for (let midi = rootMidi; midi <= highMidi; midi++) {
    if (scalePCs.has(((midi % 12) + 12) % 12)) allMidi.push(midi);
  }

  // Fallback: if fewer than 2 notes, fill chromatically
  if (allMidi.length < 2) {
    for (let midi = rootMidi; midi <= highMidi; midi++) {
      if (!allMidi.includes(midi)) allMidi.push(midi);
    }
    allMidi.sort((a, b) => a - b);
  }

  const slotRgbs = SLOT_ORDER.map((id) => {
    const slot = SLOTS.find((s) => s.id === id)!;
    return parseRgb(slot.rgb);
  });

  return allMidi.map((midi, idx) => {
    const hz = Math.round(midiToHz(midi));
    const noteName = NOTE_NAMES[((midi % 12) + 12) % 12];
    const octave = Math.floor(midi / 12) - 1;
    const [r, g, b] = slotRgbs[idx % slotRgbs.length];
    return {
      id: `${noteName}${octave}`,
      midi,
      frequencyHz: hz,
      note: noteName,
      octave,
      color: toHex(r, g, b),
      rgb: `${r}, ${g}, ${b}`,
      name: `${noteName}${octave}`,
      isSlot: false,
    };
  });
}
