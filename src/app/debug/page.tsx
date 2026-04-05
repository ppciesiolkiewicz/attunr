"use client";

import { useState, useEffect, useCallback } from "react";
import { Text, Button, Slider } from "@/components/ui";
import { VOICE_TYPES } from "@/constants/voice-types";

const ATTUNR_PREFIX = "attunr.";

function readAttunrKeys(): Record<string, string> {
  const entries: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(ATTUNR_PREFIX)) {
      entries[key] = localStorage.getItem(key) ?? "";
    }
  }
  return entries;
}

function formatValue(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

// ── Quick-set presets ────────────────────────────────────────────────────

const PRESETS = VOICE_TYPES.map((v) => ({
  label: v.label,
  lowHz: v.rangeHz[0],
  highHz: v.rangeHz[1],
}));

// ── Components ───────────────────────────────────────────────────────────

function VocalRangeEditor({ onApply }: { onApply: () => void }) {
  const [lowHz, setLowHz] = useState(() =>
    Number(localStorage.getItem("attunr.vocalRangeLowHz")) || 131,
  );
  const [highHz, setHighHz] = useState(() =>
    Number(localStorage.getItem("attunr.vocalRangeHighHz")) || 523,
  );

  function apply(low: number, high: number) {
    localStorage.setItem("attunr.vocalRangeLowHz", String(low));
    localStorage.setItem("attunr.vocalRangeHighHz", String(high));
    localStorage.setItem("attunr.onboarded", "1");
    setLowHz(low);
    setHighHz(high);
    onApply();
  }

  return (
    <div
      className="rounded-lg border px-4 py-3 flex flex-col gap-3"
      style={{ borderColor: "rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.05)" }}
    >
      <Text variant="label">Vocal Range</Text>

      {/* Presets */}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <Button
            key={p.label}
            variant="outline"
            size="sm"
            onClick={() => apply(p.lowHz, p.highHz)}
            className="text-xs px-2.5 py-1"
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Custom sliders */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Text variant="caption" color="muted-1" className="w-10">Low</Text>
          <Slider
            min={60}
            max={400}
            step={1}
            value={lowHz}
            onChange={(e) => setLowHz(Number(e.target.value))}
            className="flex-1"
          />
          <Text variant="caption" color="muted-1" className="w-16 text-right tabular-nums">
            {lowHz} Hz
          </Text>
        </div>
        <div className="flex items-center gap-3">
          <Text variant="caption" color="muted-1" className="w-10">High</Text>
          <Slider
            min={200}
            max={1200}
            step={1}
            value={highHz}
            onChange={(e) => setHighHz(Number(e.target.value))}
            className="flex-1"
          />
          <Text variant="caption" color="muted-1" className="w-16 text-right tabular-nums">
            {highHz} Hz
          </Text>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => apply(lowHz, highHz)}
          className="self-start"
        >
          Apply custom range
        </Button>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────

export default function DebugPage() {
  const [entries, setEntries] = useState<Record<string, string>>({});

  const refresh = useCallback(() => setEntries(readAttunrKeys()), []);

  useEffect(refresh, [refresh]);

  const keys = Object.keys(entries).sort();

  function handleDelete(key: string) {
    localStorage.removeItem(key);
    refresh();
  }

  function handleClearAll() {
    keys.forEach((k) => localStorage.removeItem(k));
    refresh();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Text variant="heading" as="h1">
          Debug
        </Text>
        <Button variant="ghost" size="sm" onClick={handleClearAll}>
          Clear all
        </Button>
      </div>

      {/* Quick editors */}
      <div className="flex flex-col gap-4 mb-8">
        <VocalRangeEditor onApply={refresh} />
      </div>

      {/* Raw localStorage viewer */}
      <Text variant="heading-sm" as="h2" className="mb-3">
        localStorage
      </Text>

      {keys.length === 0 ? (
        <Text variant="body-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          No attunr.* keys in localStorage.
        </Text>
      ) : (
        <div className="flex flex-col gap-2">
          {keys.map((key) => (
            <div
              key={key}
              className="rounded-lg border px-3 py-2 flex items-start justify-between gap-3"
              style={{
                borderColor: "rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.025)",
              }}
            >
              <div className="min-w-0 flex-1">
                <Text variant="label" as="div" className="mb-1">
                  {key.slice(ATTUNR_PREFIX.length)}
                </Text>
                <pre
                  className="text-xs whitespace-pre-wrap break-all"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {formatValue(entries[key])}
                </pre>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(key)}
                style={{ color: "rgba(255,100,100,0.7)", flexShrink: 0 }}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
