"use client";

import Link from "next/link";
import { TUNING_OPTIONS, hzToNoteName } from "@/constants/chakras";
import { analytics } from "@/lib/analytics";
import type { Settings } from "@/hooks/useSettings";
import type { TuningStandard } from "@/constants/chakras";

interface SettingsPanelProps {
  open: boolean;
  settings: Settings;
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onClose: () => void;
  onRedetect: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs uppercase tracking-widest font-medium text-white/38">{title}</p>
      {children}
    </div>
  );
}

export default function SettingsPanel({
  open,
  settings,
  onUpdate,
  onClose,
  onRedetect,
}: SettingsPanelProps) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col overflow-y-auto"
        style={{
          width: 320,
          background: "#0f0f1a",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "-16px 0 48px rgba(0,0,0,0.5)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-base font-semibold text-white/90">Settings</span>
          <button
            onClick={onClose}
            className="transition-colors text-xl leading-none text-white/55 hover:text-white/80"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-7 px-6 py-6 flex-1">

          {/* ── Vocal range ────────────────────────────────────────────────── */}
          <Section title="Vocal range">
            {settings.vocalRangeLowHz > 0 && settings.vocalRangeHighHz > 0 ? (
              <div className="flex items-center gap-3">
                <div
                  className="px-3.5 py-2 rounded-lg border"
                  style={{ backgroundColor: "rgba(239,139,90,0.1)", borderColor: "rgba(239,139,90,0.35)" }}
                >
                  <span className="text-sm font-medium" style={{ color: "#ef8b5a" }}>
                    {hzToNoteName(settings.vocalRangeLowHz)}
                  </span>
                  <span className="text-xs ml-1.5 text-white/38">{settings.vocalRangeLowHz} Hz</span>
                </div>
                <span className="text-white/38">→</span>
                <div
                  className="px-3.5 py-2 rounded-lg border"
                  style={{ backgroundColor: "rgba(129,140,248,0.1)", borderColor: "rgba(129,140,248,0.35)" }}
                >
                  <span className="text-sm font-medium" style={{ color: "#818cf8" }}>
                    {hzToNoteName(settings.vocalRangeHighHz)}
                  </span>
                  <span className="text-xs ml-1.5 text-white/38">{settings.vocalRangeHighHz} Hz</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-white/55">Not yet detected</p>
            )}
            <button
              onClick={onRedetect}
              className="text-sm text-violet-400/75 hover:text-violet-400 transition-colors text-left"
            >
              Re-detect my range →
            </button>
          </Section>

          <div className="h-px bg-white/[0.06]" />

          {/* ── Tuning ─────────────────────────────────────────────────────── */}
          <Section title="Tuning">
            <div className="flex flex-col gap-1.5">
              {TUNING_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onUpdate("tuning", t.id as TuningStandard);
                    analytics.settingsTuningChanged(t.id);
                  }}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left transition-all"
                  style={{
                    backgroundColor: settings.tuning === t.id ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
                    borderColor: settings.tuning === t.id ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.06)",
                  }}
                >
                  <div>
                    <p className="text-sm font-medium text-white/90">{t.label}</p>
                    <p className="text-xs mt-0.5 text-white/55">{t.description}</p>
                  </div>
                  {settings.tuning === t.id && (
                    <span className="text-sm ml-2 text-white/55">✓</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs leading-relaxed text-white/38">
              Try each and keep the one that feels right for your practice.
              Tuning applies in voice-based mode.
            </p>
            <Link
              href="/articles/tuning"
              onClick={onClose}
              className="text-sm text-violet-400/65 hover:text-violet-400 transition-colors"
            >
              Learn about tuning →
            </Link>
          </Section>

          <div className="h-px bg-white/[0.06]" />

          {/* ── About ──────────────────────────────────────────────────────── */}
          <Section title="About">
            <p className="text-xs leading-relaxed text-white/38">
              Your microphone is used only for real-time pitch detection.
              Nothing is ever recorded or stored outside your device.
            </p>
            <Link
              href="/articles/solfeggio-frequencies"
              onClick={onClose}
              className="text-sm text-violet-400/65 hover:text-violet-400 transition-colors"
            >
              What are Solfeggio frequencies? →
            </Link>
          </Section>
        </div>
      </div>
    </>
  );
}
