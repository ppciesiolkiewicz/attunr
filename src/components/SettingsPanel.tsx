"use client";

import { VOICE_TYPES, TUNING_OPTIONS } from "@/constants/chakras";
import type { Settings } from "@/hooks/useSettings";
import type { VoiceTypeId, TuningStandard } from "@/constants/chakras";
// binaural is always on — no toggle needed

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
      <p className="text-xs uppercase tracking-widest text-white/42 font-medium">{title}</p>
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
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <span className="text-base font-semibold text-white">Settings</span>
          <button
            onClick={onClose}
            className="text-white/58 hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-7 px-6 py-6 flex-1">

          {/* ── Voice ──────────────────────────────────────────────────────── */}
          <Section title="Voice">
            <div className="flex flex-wrap gap-1.5">
              {VOICE_TYPES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => onUpdate("voiceType", v.id as VoiceTypeId)}
                  className="px-4 py-2 rounded-full text-sm font-medium border transition-all"
                  style={{
                    backgroundColor: settings.voiceType === v.id ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.04)",
                    borderColor: settings.voiceType === v.id ? "rgba(124,58,237,0.8)" : "rgba(255,255,255,0.1)",
                    color: settings.voiceType === v.id ? "#c4b5fd" : "rgba(255,255,255,0.45)",
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <button
              onClick={onRedetect}
              className="text-sm text-violet-400/75 hover:text-violet-400 transition-colors text-left"
            >
              Re-detect my voice type →
            </button>
          </Section>

          <div className="h-px bg-white/[0.06]" />

          {/* ── Tuning ─────────────────────────────────────────────────────── */}
          <Section title="Tuning">
            <div className="flex flex-col gap-1.5">
              {TUNING_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onUpdate("tuning", t.id as TuningStandard)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left transition-all"
                  style={{
                    backgroundColor: settings.tuning === t.id ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.02)",
                    borderColor: settings.tuning === t.id ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)",
                  }}
                >
                  <div>
                    <p className="text-sm font-medium text-white/85">{t.label}</p>
                    <p className="text-xs text-white/52 mt-0.5">{t.description}</p>
                  </div>
                  {settings.tuning === t.id && (
                    <span className="text-white/65 text-sm ml-2">✓</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-white/42 leading-relaxed">
              Try each and keep the one that feels right for your practice.
              Tuning applies in voice-based mode.
            </p>
          </Section>

          <div className="h-px bg-white/[0.06]" />

          {/* ── About ──────────────────────────────────────────────────────── */}
          <Section title="About">
            <p className="text-xs text-white/42 leading-relaxed">
              Your microphone is used only for real-time pitch detection.
              Nothing is ever recorded or stored outside your device.
            </p>
            <a
              href="https://en.wikipedia.org/wiki/Solfeggio_frequencies"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-violet-400/65 hover:text-violet-400 transition-colors"
            >
              What are Solfeggio frequencies? →
            </a>
          </Section>
        </div>
      </div>
    </>
  );
}
