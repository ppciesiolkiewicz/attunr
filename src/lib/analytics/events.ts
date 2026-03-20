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
  journeyExerciseStarted: (exerciseId: number, part: number, partName: string) =>
    capture("journey_exercise_started", { exercise_id: exerciseId, part, part_name: partName }),
  journeyExerciseCompleted: (exerciseId: number, part: number, skipped?: boolean) =>
    capture("journey_exercise_completed", { exercise_id: exerciseId, part, skipped }),
  journeyPartCompleted: (part: number, partName: string) =>
    capture("journey_part_completed", { part, part_name: partName }),

  // Explore & tone
  exploreViewed: () => capture("explore_viewed"),
  tonePlayed: (slotId: string, source: "journey" | "explore") =>
    capture("tone_played", { slot_id: slotId, source }),

  // Articles
  articleViewed: (slug: string, title: string) =>
    capture("article_viewed", { slug, title }),

  // Landing
  landingCtaClicked: (buttonName: string, variant?: string) =>
    capture("landing_cta_clicked", { button_name: buttonName, variant }),
  landingVariantViewed: (variant: string) =>
    capture("landing_variant_viewed", { variant }),

  // Onboarding (granular)
  onboardingStarted: () => capture("onboarding_started"),
  onboardingPhaseChanged: (phase: string) =>
    capture("onboarding_phase_changed", { phase }),

  // Cookie consent
  cookieConsentResponded: (response: "accepted" | "declined") =>
    capture("cookie_consent_responded", { response }),

  // Journey navigation
  journeyViewed: () => capture("journey_viewed"),
  chapterViewed: (chapterId: number, chapterTitle: string) =>
    capture("chapter_viewed", { chapter_id: chapterId, chapter_title: chapterTitle }),

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

  // Notifications
  notificationPromptShown: () => capture("notification_prompt_shown"),
  notificationPermissionResult: (result: string) =>
    capture("notification_permission_result", { result }),
  notificationFrequencySelected: (frequency: string) =>
    capture("notification_frequency_selected", { frequency }),
  notificationToggled: (enabled: boolean) =>
    capture("notification_toggled", { enabled }),
};
