import posthog from "posthog-js";

function capture(name: string, props?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    posthog.capture(name, props);
  }
}

export const analytics = {
  pageView: (url: string) => capture("$pageview", { $current_url: url }),

  // Onboarding
  onboardingCompleted: (voiceType: string, detected?: boolean, lowHz?: number, highHz?: number) =>
    capture("onboarding_completed", { voice_type: voiceType, detected: !!detected, low_hz: lowHz, high_hz: highHz }),

  // Journey
  journeyExerciseStarted: (stageId: number, part: number, partName: string) =>
    capture("journey_exercise_started", { stage_id: stageId, part, part_name: partName }),
  journeyStageCompleted: (stageId: number, part: number, skipped?: boolean) =>
    capture("journey_stage_completed", { stage_id: stageId, part, skipped }),
  journeyPartCompleted: (part: number, partName: string) =>
    capture("journey_part_completed", { part, part_name: partName }),

  // Explore & tone
  exploreViewed: () => capture("explore_viewed"),
  tonePlayed: (chakraId: string, source: "journey" | "explore") =>
    capture("tone_played", { chakra_id: chakraId, source }),

  // Articles
  articleViewed: (slug: string, title: string) =>
    capture("article_viewed", { slug, title }),

  // Auth
  loginCodeSent: () => capture("login_code_sent"),
  loginSucceeded: () => capture("login_succeeded"),
  logout: () => capture("logout"),

  // Settings
  settingsOpened: () => capture("settings_opened"),
  settingsVoiceChanged: (voiceType: string) =>
    capture("settings_changed", { setting: "voice_type", value: voiceType }),
  settingsTuningChanged: (tuning: string) =>
    capture("settings_changed", { setting: "tuning", value: tuning }),
};
