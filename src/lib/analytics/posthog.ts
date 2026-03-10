import posthog from "posthog-js";

export function initPostHog() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";
  if (key) {
    posthog.init(key, {
      api_host: host,
      person_profiles: "identified_only",
      capture_pageview: false, // We track manually for SPA navigation
      disable_session_recording: true, // Not using; reduces cost & bundle
      disable_surveys: true, // Not using; reduces bundle size
    });
  }
}
