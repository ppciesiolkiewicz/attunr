# Analytics (PostHog)

PostHog is used for product analytics. Events are tracked client-side via `posthog-js`. No voice or pitch data is ever sent — only usage metadata (e.g. which chakra, which page).

## Configuration

- **Provider**: PostHog Cloud (EU region by default)
- **Env vars** (see `.env.example`):
  - `NEXT_PUBLIC_POSTHOG_KEY` — Project API key from [PostHog project settings](https://app.posthog.com/project/settings)
  - `NEXT_PUBLIC_POSTHOG_HOST` — Optional. Defaults to `https://eu.i.posthog.com` for EU. Use `https://us.i.posthog.com` for US.

## Page views

Tracked automatically on every route change via `PostHogPageView`:

- `$pageview` — Fired when pathname changes (SPA navigation)

## Custom events

| Event | When | Properties |
|-------|------|------------|
| `onboarding_completed` | User finishes onboarding (selects or detects voice type) | `voice_type`, `detected` (bool) |
| `journey_exercise_started` | User enters a journey exercise screen | `stage_id`, `part`, `part_name` |
| `journey_stage_completed` | User completes a stage (clicks Next/Complete) | `stage_id`, `part` |
| `journey_part_completed` | User completes the last stage of a part | `part`, `part_name` |
| `tone_played` | User plays a chakra tone | `chakra_id`, `source` ("journey" \| "explore") |
| `explore_viewed` | User opens Explore page | — |
| `article_viewed` | User views an article | `slug`, `title` |
| `login_code_sent` | User requests magic link / OTP | — |
| `login_succeeded` | User successfully verifies OTP | — |
| `logout` | User logs out | — |
| `settings_opened` | User opens settings panel | — |
| `settings_changed` | User changes a setting | `setting` ("voice_type" \| "tuning"), `value` |

## What we do NOT track

- Pitch values (Hz)
- Microphone/voice input
- Any data that could reconstruct a user's vocal performance

## Implementation

- **Directory**: `src/lib/analytics/`
  - `posthog.ts` — PostHog init (called from root `instrumentation-client.ts`)
  - `events.ts` — event capture helpers (`analytics` object)
  - `index.ts` — re-exports
- **Page views**: `PostHogPageView` in `AppShell`
- **Usage**: `import { analytics } from "@/lib/analytics"` then `analytics.<eventName>(...)`
