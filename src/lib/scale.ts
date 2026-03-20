import { Note, Scale as TonalScale } from "tonal";
import type { ResolvedNote, ColoredNote, VocalRange } from "@/lib/VocalRange";
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
  /** 0-based array index of the root note within this.notes. */
  readonly rootIndex: number;
  private readonly vocalRange: VocalRange;

  constructor(definition: BaseScale, vocalRange: VocalRange) {
    this.vocalRange = vocalRange;
    const result = Scale.buildNotes(definition, vocalRange);
    this.notes = result.notes;
    this.rootIndex = result.rootIndex;
  }

  /** Pick specific note(s) by index or range. Original semantics: negative Index = from end. */
  resolve(target: NoteTarget): ResolvedNote[] {
    const n = this.notes.length;
    if (n === 0) return [];

    if (target.kind === BandTargetKind.Index) {
      // 1-indexed: positive i maps to array index i-1, negative i maps from end
      const idx = target.i < 0 ? n + target.i : target.i - 1;
      return idx >= 0 && idx < n ? [this.notes[idx]] : [];
    }

    if (target.kind === BandTargetKind.Range) {
      // Convert 1-indexed from/to to 0-indexed array positions
      const fromIdx = target.from < 0 ? n + target.from : target.from - 1;
      const toIdx = target.to < 0 ? n + target.to : target.to - 1;
      const lo = Math.max(0, Math.min(fromIdx, toIdx));
      const hi = Math.min(n - 1, Math.max(fromIdx, toIdx));
      return this.notes.slice(lo, hi + 1);
    }

    return [];
  }

  /**
   * Root-relative resolution for melody events.
   * Index: i=1 is root, i=0 is one below root, i=-1 is two below root.
   * Range: delegates to resolve() (unchanged full-array semantics).
   */
  resolveFromRoot(target: NoteTarget): ResolvedNote[] {
    if (target.kind === BandTargetKind.Index) {
      const n = this.notes.length;
      if (n === 0) return [];
      const idx = this.rootIndex + (target.i - 1);
      return idx >= 0 && idx < n ? [this.notes[idx]] : [];
    }
    return this.resolve(target);
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
  private static buildNotes(
    definition: BaseScale,
    vocalRange: VocalRange,
  ): { notes: ResolvedNote[]; rootIndex: number } {
    const lowMidi = Note.midi(vocalRange.lowNote);
    const highMidi = Note.midi(vocalRange.highNote);
    if (lowMidi == null || highMidi == null) return { notes: [], rootIndex: 0 };

    if (definition.type === "even-7-from-major") {
      const notes = Scale.buildEven7FromMajor(lowMidi, highMidi, definition.root);
      return { notes, rootIndex: 0 };
    }

    // Compute rootMidi based on startPoint
    const startPoint = definition.startPoint ?? "start";
    let rootMidi: number;
    if (startPoint === "end") {
      rootMidi = highMidi - (definition.root - 1);
    } else if (startPoint === "center") {
      const centerMidi = Math.round((lowMidi + highMidi) / 2);
      rootMidi = centerMidi + (definition.root - 1);
    } else {
      rootMidi = lowMidi + (definition.root - 1);
    }

    return Scale.buildTonalScale(lowMidi, highMidi, definition.type, rootMidi);
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

  /** Build notes for any tonal.js scale type. Includes notes below root. */
  private static buildTonalScale(
    lowMidi: number,
    highMidi: number,
    scaleType: string,
    rootMidi: number,
  ): { notes: ResolvedNote[]; rootIndex: number } {
    const rootName = NOTE_NAMES[((rootMidi % 12) + 12) % 12];

    // For chromatic, every semitone matches; for named scales, use pitch classes
    const isChromatic = scaleType === "chromatic";
    let scalePCs: Set<number> | null = null;
    if (!isChromatic) {
      const scaleNotes = TonalScale.get(`${rootName} ${scaleType}`).notes;
      scalePCs = new Set(scaleNotes.map((n) => Note.chroma(n) ?? -1));
    }
    const matches = (midi: number) =>
      isChromatic || scalePCs!.has(((midi % 12) + 12) % 12);

    // Notes below root (lowMidi to rootMidi - 1)
    const belowRoot: number[] = [];
    for (let midi = lowMidi; midi < rootMidi; midi++) {
      if (matches(midi)) belowRoot.push(midi);
    }

    // Notes from root upward (rootMidi to highMidi)
    const fromRoot: number[] = [];
    for (let midi = rootMidi; midi <= highMidi; midi++) {
      if (matches(midi)) fromRoot.push(midi);
    }

    const allMidi = [...belowRoot, ...fromRoot];
    const rootIndex = belowRoot.length;

    // Fallback: if fewer than 2 notes from root, fill chromatically
    if (fromRoot.length < 2) {
      for (let midi = rootMidi; midi <= highMidi; midi++) {
        if (!allMidi.includes(midi)) allMidi.push(midi);
      }
      allMidi.sort((a, b) => a - b);
    }

    return {
      notes: allMidi.map((midi) => Scale.midiToResolvedNote(midi)),
      rootIndex,
    };
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
