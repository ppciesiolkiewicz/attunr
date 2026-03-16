import { Note, Scale as TonalScale } from "tonal";
import type { ResolvedNote, ColoredNote, VocalRange } from "@/constants/tone-slots";
import type { NoteTarget, BaseScale } from "@/constants/journey/types";
import { BandTargetKind } from "@/constants/journey/types";
import { midiToHz, NOTE_NAMES } from "@/lib/pitch";

/**
 * Encapsulates a note pool built from a scale definition + vocal range.
 * Provides target resolution and colorization.
 */
export class Scale {
  /** All notes in this scale, sorted low → high. */
  readonly notes: ResolvedNote[];
  private readonly vocalRange: VocalRange;

  constructor(definition: BaseScale, vocalRange: VocalRange) {
    this.vocalRange = vocalRange;
    this.notes = Scale.buildNotes(definition, vocalRange);
  }

  /** Pick specific note(s) by index or range. */
  resolve(target: NoteTarget): ResolvedNote[] {
    const n = this.notes.length;
    if (n === 0) return [];

    if (target.kind === BandTargetKind.Index) {
      const i = target.i < 0 ? n + target.i : target.i;
      return i >= 0 && i < n ? [this.notes[i]] : [];
    }

    if (target.kind === BandTargetKind.Range) {
      const from = target.from < 0 ? n + target.from : target.from;
      const to = target.to < 0 ? n + target.to : target.to;
      const lo = Math.max(0, Math.min(from, to));
      const hi = Math.min(n - 1, Math.max(from, to));
      return this.notes.slice(lo, hi + 1);
    }

    return [];
  }

  /** Map colors from VocalRange onto this scale's notes. */
  colorize(): ColoredNote[] {
    const colorMap = new Map<number, { color: string; rgb: string }>();
    for (const cn of this.vocalRange.allNotes) {
      colorMap.set(cn.midi, { color: cn.color, rgb: cn.rgb });
    }

    return this.notes.map((note) => {
      const match = colorMap.get(note.midi);
      if (match) {
        return { ...note, color: match.color, rgb: match.rgb };
      }
      return { ...note, ...Scale.nearestColor(note.midi, this.vocalRange.allNotes) };
    });
  }

  /** Find color of nearest note by midi distance. */
  private static nearestColor(midi: number, allNotes: ColoredNote[]): { color: string; rgb: string } {
    if (allNotes.length === 0) return { color: "#888888", rgb: "136, 136, 136" };
    let closest = allNotes[0];
    let minDist = Math.abs(midi - closest.midi);
    for (let i = 1; i < allNotes.length; i++) {
      const dist = Math.abs(midi - allNotes[i].midi);
      if (dist < minDist) {
        closest = allNotes[i];
        minDist = dist;
      }
    }
    return { color: closest.color, rgb: closest.rgb };
  }

  /** Build the note pool for a scale definition. */
  private static buildNotes(definition: BaseScale, vocalRange: VocalRange): ResolvedNote[] {
    const lowMidi = Note.midi(vocalRange.lowNote);
    const highMidi = Note.midi(vocalRange.highNote);
    if (lowMidi == null || highMidi == null) return [];

    if (definition.type === "even-7-from-major") {
      return Scale.buildEven7FromMajor(lowMidi, highMidi, definition.root);
    }

    return Scale.buildTonalScale(lowMidi, highMidi, definition.type, definition.root);
  }

  /** Build 7 evenly-spaced notes from the major scale across the range. */
  private static buildEven7FromMajor(lowMidi: number, highMidi: number, root: number): ResolvedNote[] {
    const rootMidi = lowMidi + (root - 1);
    const rootName = NOTE_NAMES[((rootMidi % 12) + 12) % 12];
    const scaleNotes = TonalScale.get(`${rootName} major`).notes;
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

    // Fallback: chromatic steps
    if (allMidi.length === 0) {
      return Array.from({ length: 7 }, (_, i) => {
        const midi = lowMidi + Math.round((i * (highMidi - lowMidi)) / 6);
        return Scale.midiToResolvedNote(midi);
      });
    }

    // Pick 7 evenly-spaced
    const n = allMidi.length;
    const indices = Array.from({ length: 7 }, (_, i) =>
      n <= 7 ? i : Math.round((i * (n - 1)) / 6)
    );

    return indices
      .filter((idx) => idx < allMidi.length)
      .map((idx) => Scale.midiToResolvedNote(allMidi[idx]));
  }

  /** Build notes for any tonal.js scale type. */
  private static buildTonalScale(lowMidi: number, highMidi: number, scaleType: string, root: number): ResolvedNote[] {
    const rootMidi = lowMidi + (root - 1);
    const rootName = NOTE_NAMES[((rootMidi % 12) + 12) % 12];
    const scaleNotes = TonalScale.get(`${rootName} ${scaleType}`).notes;
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

    return allMidi.map((midi) => Scale.midiToResolvedNote(midi));
  }

  /** Convert a MIDI number to a ResolvedNote. */
  private static midiToResolvedNote(midi: number): ResolvedNote {
    const hz = Math.round(midiToHz(midi));
    const noteName = NOTE_NAMES[((midi % 12) + 12) % 12];
    const octave = Math.floor(midi / 12) - 1;
    return {
      id: `${noteName}${octave}`,
      midi,
      frequencyHz: hz,
      note: noteName,
      octave,
      name: `${noteName}${octave}`,
    };
  }
}
