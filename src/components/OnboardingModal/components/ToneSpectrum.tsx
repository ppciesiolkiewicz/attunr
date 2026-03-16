"use client";

import { NOTE_PALETTE } from "@/constants/tone-slots";

export function ToneSpectrum() {
  return (
    <div className="flex items-center gap-2.5">
      {NOTE_PALETTE.map((p, i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: 9,
            height: 9,
            backgroundColor: p.color,
            boxShadow: "0 0 7px " + p.color + "88",
          }}
        />
      ))}
    </div>
  );
}
