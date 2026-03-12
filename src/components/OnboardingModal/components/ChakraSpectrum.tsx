"use client";

import { BAND_ID_ORDER, CHAKRAS } from "@/constants/chakras";

const CHAKRA_COLORS = BAND_ID_ORDER.map(
  (id) => CHAKRAS.find((c) => c.id === id)!.color,
);

export function ChakraSpectrum() {
  return (
    <div className="flex items-center gap-2.5">
      {CHAKRA_COLORS.map((color, i) => (
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
