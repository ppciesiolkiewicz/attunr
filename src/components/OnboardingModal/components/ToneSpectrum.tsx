"use client";

import { SLOTS, SLOT_ORDER } from "@/constants/tone-slots";

const SLOT_COLORS = SLOT_ORDER.map(
  (id) => SLOTS.find((s) => s.id === id)!.color,
);

export function ToneSpectrum() {
  return (
    <div className="flex items-center gap-2.5">
      {SLOT_COLORS.map((color, i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: 9,
            height: 9,
            backgroundColor: color,
            boxShadow: "0 0 7px " + color + "88",
          }}
        />
      ))}
    </div>
  );
}
