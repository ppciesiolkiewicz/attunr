# Contact Page Design

## Overview

A simple, warm contact form at `/contact` where anyone can send feedback, ideas, bug reports, or proposals. Submissions are captured as PostHog events — no backend or new dependencies needed.

## Route

`/contact` — new `"use client"` page at `src/app/contact/page.tsx`

## Form Fields

1. **Email** — `<label>` + `<input type="email">`, required. Placeholder: "your@email.com"
2. **Message** — `<label>` + `<textarea rows={5}>`, required, `maxLength={2000}`. Placeholder: "What's on your mind?"

Both use existing input styling from the login page: `bg-white/[0.06]`, `border-white/[0.1]`, violet focus ring. Labels use `<Text variant="label">`.

## Copy

Warm, welcoming heading and subtext above the form. Tone: personal, encouraging — make people feel their voice matters. Something like:

> **We'd love to hear from you**
>
> Got an idea? Found a bug? Want to share how your practice is going?
> Whatever it is, we're listening. Every message helps shape what Attunr becomes.

Final copy to be refined during implementation, but this captures the tone.

## Submit Behavior

- **Button**: "Send" using `<Button>` component, `variant="solid"`, `color="secondary"` (matching login page)
- **Loading state**: disable button + show "Sending..." while submitting
- **Validation**: client-side — HTML5 `type="email"` + `required` on both fields (browser-native validation)
- **On submit**: fire PostHog event via `analytics.contactSubmitted(email, message)`
- **Success state**: replace form with a thank-you message + "Send another message" link to reset the form
- **Error state**: not needed (PostHog capture is fire-and-forget)

## Analytics Event

Add to `src/lib/analytics/events.ts`:

```ts
contactSubmitted: (email: string, message: string) =>
  capture("contact_submitted", { email, message }),
```

## Entry Points

1. **Footer** (`src/components/Footer.tsx`): add "Talk to us" link alongside Privacy, Terms, Manifesto
2. **SettingsPanel** (`src/components/SettingsPanel.tsx`): add "Talk to us →" link at the bottom of the About section, same style as existing article links

## Page Structure

Simple centered layout, no sidebar/nav chrome needed (AppShell already provides header). Top-aligned with generous padding to feel spacious and intentional.

```
┌─────────────────────────────┐
│  [Heading]                  │
│  [Subtext]                  │
│                             │
│  [Email label + input]      │
│  [Message label + textarea] │
│  [Send button]              │
│                             │
│  — or after submit —        │
│                             │
│  [Thank you message]        │
│  [Send another message]     │
└─────────────────────────────┘
```

Max-width container (`max-w-md`) to keep it focused and readable.

## Files Changed

| File | Change |
|------|--------|
| `src/app/contact/page.tsx` | New — contact form page |
| `src/lib/analytics/events.ts` | Add `contactSubmitted` event |
| `src/components/Footer.tsx` | Add "Talk to us" link |
| `src/components/SettingsPanel.tsx` | Add "Talk to us" link in About section |

## No New Dependencies

Uses existing: `Button`, `Text` from `@ui`, `analytics` from `@/lib/analytics`, `Link` from `next/link`.
