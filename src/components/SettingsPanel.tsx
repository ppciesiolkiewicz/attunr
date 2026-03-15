"use client";

import Link from "next/link";
import { Button, CloseButton, SelectableCard, Text } from "@/components/ui";
import { TUNING_OPTIONS } from "@/constants/tuning";
import type { TuningStandard } from "@/constants/tuning";
import { hzToNoteName } from "@/lib/pitch";
import { analytics } from "@/lib/analytics";
import type { Settings } from "@/hooks/useSettings";

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
      <Text variant="label" color="muted-1">{title}</Text>
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
          <Text as="span" variant="body" color="text-1" className="font-semibold">Settings</Text>
          <CloseButton onClick={onClose} />
        </div>

        <div className="flex flex-col gap-7 px-6 py-6 flex-1">

          {/* -- Vocal range -------------------------------------------------- */}
          <Section title="Vocal range">
            {settings.vocalRangeLowHz > 0 && settings.vocalRangeHighHz > 0 ? (
              <div className="flex items-center gap-3">
                <div
                  className="px-3.5 py-2 rounded-lg border"
                  style={{ backgroundColor: "rgba(239,139,90,0.1)", borderColor: "rgba(239,139,90,0.35)" }}
                >
                  <Text as="span" variant="body-sm" className="font-medium" style={{ color: "#ef8b5a" }}>
                    {hzToNoteName(settings.vocalRangeLowHz)}
                  </Text>
                  <Text as="span" variant="caption" color="muted-1" className="ml-1.5">{settings.vocalRangeLowHz} Hz</Text>
                </div>
                <Text as="span" variant="caption" color="muted-1">→</Text>
                <div
                  className="px-3.5 py-2 rounded-lg border"
                  style={{ backgroundColor: "rgba(129,140,248,0.1)", borderColor: "rgba(129,140,248,0.35)" }}
                >
                  <Text as="span" variant="body-sm" className="font-medium" style={{ color: "#818cf8" }}>
                    {hzToNoteName(settings.vocalRangeHighHz)}
                  </Text>
                  <Text as="span" variant="caption" color="muted-1" className="ml-1.5">{settings.vocalRangeHighHz} Hz</Text>
                </div>
              </div>
            ) : (
              <Text variant="body-sm" color="text-2">Not yet detected</Text>
            )}
            <Button variant="ghost" onClick={onRedetect} className="text-sm text-violet-400/82 hover:text-violet-400 text-left">
              Re-detect my range →
            </Button>
          </Section>

          <div className="h-px bg-white/[0.06]" />

          {/* -- Tuning ------------------------------------------------------- */}
          <Section title="Tuning">
            <div className="flex flex-col gap-1.5">
              {TUNING_OPTIONS.map((t) => (
                <SelectableCard
                  key={t.id}
                  selected={settings.tuning === t.id}
                  onClick={() => {
                    onUpdate("tuning", t.id as TuningStandard);
                    analytics.settingsTuningChanged(t.id);
                  }}
                >
                  <div>
                    <Text variant="body-sm" color="text-1" className="font-medium">{t.label}</Text>
                    <Text variant="caption" color="text-2" className="mt-0.5">{t.description}</Text>
                  </div>
                  {settings.tuning === t.id && (
                    <Text as="span" variant="body-sm" color="text-2" className="ml-2">✓</Text>
                  )}
                </SelectableCard>
              ))}
            </div>
            <Text variant="caption" color="muted-1" className="leading-relaxed">
              Try each and keep the one that feels right for your practice.
              Tuning applies in voice-based mode.
            </Text>
            <Link
              href="/articles/tuning"
              onClick={onClose}
              className="cursor-pointer text-sm text-violet-400/75 hover:text-violet-400 transition-colors"
            >
              Learn about tuning →
            </Link>
          </Section>

          <div className="h-px bg-white/[0.06]" />

          {/* -- About -------------------------------------------------------- */}
          <Section title="About">
            <Text variant="caption" color="muted-1" className="leading-relaxed">
              Your microphone is used only for real-time pitch detection.
              Nothing is ever recorded or stored outside your device.
            </Text>
            <Link
              href="/articles/solfeggio-frequencies"
              onClick={onClose}
              className="cursor-pointer text-sm text-violet-400/75 hover:text-violet-400 transition-colors"
            >
              What are Solfeggio frequencies? →
            </Link>
          </Section>
        </div>
      </div>
    </>
  );
}
