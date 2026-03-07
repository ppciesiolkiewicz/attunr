"use client";

import { CHAKRAS } from "@/constants/chakras";
import type { DroneTarget } from "@/hooks/useSettings";

interface AudioControlsProps {
  drone: DroneTarget;
  binaural: boolean;
  onDroneChange: (value: DroneTarget) => void;
  onBinauralChange: (value: boolean) => void;
}

export default function AudioControls({
  drone,
  binaural,
  onDroneChange,
  onBinauralChange,
}: AudioControlsProps) {
  const droneOptions: { id: DroneTarget; label: string }[] = [
    { id: "off", label: "Off" },
    ...CHAKRAS.map((c) => ({ id: c.id as DroneTarget, label: c.name })),
  ];

  const activeDrone = CHAKRAS.find((c) => c.id === drone);

  return (
    <div className="flex items-center gap-3 flex-wrap justify-center">
      {/* Drone selector */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-white/30">Drone</span>
        <select
          value={drone}
          onChange={(e) => onDroneChange(e.target.value as DroneTarget)}
          className="text-[11px] rounded-md px-2 py-1 border appearance-none cursor-pointer focus:outline-none transition-colors"
          style={{
            background: "rgba(255,255,255,0.05)",
            borderColor: activeDrone ? `${activeDrone.color}55` : "rgba(255,255,255,0.1)",
            color: activeDrone ? activeDrone.color : "rgba(255,255,255,0.45)",
          }}
        >
          {droneOptions.map((o) => (
            <option key={o.id} value={o.id} style={{ background: "#0f0f1a" }}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Divider */}
      <div className="w-px h-3 bg-white/10" />

      {/* Binaural toggle */}
      <button
        onClick={() => onBinauralChange(!binaural)}
        className="flex items-center gap-1.5 text-[11px] transition-colors"
        style={{ color: binaural ? "rgba(167,139,250,0.9)" : "rgba(255,255,255,0.3)" }}
      >
        <span>🎧</span>
        <span>Binaural</span>
        <span
          className="inline-block rounded-full transition-colors"
          style={{
            width: 24,
            height: 13,
            background: binaural ? "rgba(124,58,237,0.7)" : "rgba(255,255,255,0.12)",
            position: "relative",
          }}
        >
          <span
            className="absolute top-0.5 rounded-full transition-all"
            style={{
              width: 9,
              height: 9,
              background: "white",
              left: binaural ? 12 : 2,
            }}
          />
        </span>
      </button>
    </div>
  );
}
