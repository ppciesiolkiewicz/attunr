import { Note, Scale } from "tonal";
import type { Chakra, ChakraId, Band } from "@/constants/chakras";
import { CHAKRAS, BAND_ID_ORDER } from "@/constants/chakras";
import { VOICE_TYPES } from "@/constants/voice-types";
import type { VoiceTypeId } from "@/constants/voice-types";
import { TUNING_A_HZ } from "@/constants/tuning";
import type { TuningStandard, FrequencyBase } from "@/constants/tuning";
import { hzToMidi, midiToHz, fitToRange, NOTE_NAMES } from "@/lib/pitch";
import { parseRgb, lerpColor, toHex } from "@/lib/color";

export function getScaleNotes(
  base: FrequencyBase,
  voiceId: VoiceTypeId,
  tuning: TuningStandard
): Chakra[] {
  const tuningScale = TUNING_A_HZ[tuning] / 432;

  if (base === "absolute") {
    return CHAKRAS.map((c) => ({
      ...c,
      frequencyHz: Math.round(c.frequencyHz * tuningScale),
    }));
  }

  const voice = VOICE_TYPES.find((v) => v.id === voiceId) ?? VOICE_TYPES[2];
  const [low, high] = voice.rangeHz;

  return CHAKRAS.map((c) => ({
    ...c,
    frequencyHz: Math.round(fitToRange(c.frequencyHz * tuningScale, low, high)),
  }));
}

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
 * chakra slots carrying full chakra metadata and interpolated colors for the rest.
 * Returns Band[] sorted low → high.
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

  // Parse chakra RGB values once
  const chakraRgbs = BAND_ID_ORDER.map((id) => {
    const chakra = CHAKRAS.find((c) => c.id === id)!;
    return parseRgb(chakra.rgb);
  });

  // Get interpolated color for any band index
  function colorAt(idx: number): { hex: string; rgb: string } {
    if (idx <= slotIndices[0]) {
      const [r, g, b] = chakraRgbs[0];
      return { hex: toHex(r, g, b), rgb: `${r}, ${g}, ${b}` };
    }
    if (idx >= slotIndices[6]) {
      const [r, g, b] = chakraRgbs[6];
      return { hex: toHex(r, g, b), rgb: `${r}, ${g}, ${b}` };
    }
    for (let s = 0; s < 6; s++) {
      if (idx >= slotIndices[s] && idx <= slotIndices[s + 1]) {
        const span = slotIndices[s + 1] - slotIndices[s];
        const t = span === 0 ? 0 : (idx - slotIndices[s]) / span;
        const [r, g, b] = lerpColor(chakraRgbs[s], chakraRgbs[s + 1], t);
        return { hex: toHex(r, g, b), rgb: `${r}, ${g}, ${b}` };
      }
    }
    const [r, g, b] = chakraRgbs[0];
    return { hex: toHex(r, g, b), rgb: `${r}, ${g}, ${b}` };
  }

  return allMidi.map((midi, idx) => {
    const hz = Math.round(midiToHz(midi));
    const noteName = NOTE_NAMES[((midi % 12) + 12) % 12];
    const octave = Math.floor(midi / 12) - 1;

    if (slotIndexSet.has(idx)) {
      const slotNum = slotIndices.indexOf(idx); // 0-based slot number
      const chakraId = BAND_ID_ORDER[slotNum];
      const chakra = CHAKRAS.find((c) => c.id === chakraId)!;
      return {
        id: chakraId,
        midi,
        frequencyHz: hz,
        note: noteName,
        octave,
        color: chakra.color,
        rgb: chakra.rgb,
        name: chakra.name,
        isChakraSlot: true,
        chakraId: chakraId as ChakraId,
        mantra: chakra.mantra,
        description: chakra.description,
        longDescription: chakra.longDescription,
        element: chakra.element,
        interestingFact: chakra.interestingFact,
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
      isChakraSlot: false,
    };
  });
}
