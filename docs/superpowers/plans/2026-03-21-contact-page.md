# Contact Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/contact` page with email + message form that captures submissions as PostHog events.

**Architecture:** Single client page component with form state management. PostHog event fired on submit. Entry point links added to Footer and SettingsPanel.

**Tech Stack:** Next.js App Router, React useState, PostHog (existing), Tailwind CSS, existing Button/Text atoms.

**Spec:** `docs/superpowers/specs/2026-03-21-contact-page-design.md`

---

### Task 1: Add analytics event

**Files:**
- Modify: `src/lib/analytics/events.ts:72` (before closing brace)

- [ ] **Step 1: Add `contactSubmitted` event to analytics**

Add after the `notificationToggled` entry (line 72):

```ts
  // Contact
  contactSubmitted: (email: string, message: string) =>
    capture("contact_submitted", { email, message }),
```

- [ ] **Step 2: Verify build**

Run: `npx next build --no-lint 2>&1 | tail -5` or `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/analytics/events.ts
git commit -m "feat: add contact_submitted analytics event"
```

---

### Task 2: Create contact page

**Files:**
- Create: `src/app/contact/page.tsx`

- [ ] **Step 1: Create the contact page**

Create `src/app/contact/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Text } from "@/components/ui";
import { analytics } from "@/lib/analytics";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    analytics.contactSubmitted(email.trim(), message.trim());
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 600);
  }

  function handleReset() {
    setEmail("");
    setMessage("");
    setSent(false);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-4 py-12">
        <div className="w-full max-w-md text-center">
          <Text variant="heading-lg" className="mb-2">Thank you!</Text>
          <Text variant="body" color="text-2" className="mb-8">
            We read every message. Yours means a lot.
          </Text>
          <Button
            variant="ghost"
            onClick={handleReset}
            className="text-sm text-violet-400/75 hover:text-violet-400"
          >
            Send another message
          </Button>
          <Text variant="body-sm" color="muted-1" className="mt-6">
            <Link href="/" className="hover:text-white/70">
              ← Back to attunr
            </Link>
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-12">
      <div className="w-full max-w-md">
        <Text variant="heading-lg" className="mb-2">We'd love to hear from you</Text>
        <Text variant="body" color="text-2" className="mb-8 leading-relaxed">
          Got an idea? Found a bug? Want to share how your practice is going?
          Whatever it is, we're listening. Every message helps shape what Attunr becomes.
        </Text>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <Text as="span" variant="body-sm" color="text-2">Email</Text>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
              className="mt-1.5 w-full px-4 py-3 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white placeholder-white/30 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
          </label>

          <label className="block">
            <Text as="span" variant="body-sm" color="text-2">Message</Text>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What's on your mind?"
              required
              rows={5}
              maxLength={2000}
              className="mt-1.5 w-full px-4 py-3 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white placeholder-white/30 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none"
            />
          </label>

          <Button variant="solid" color="secondary" type="submit" disabled={sending} className="w-full py-3">
            {sending ? "Sending…" : "Send"}
          </Button>
        </form>

        <Text variant="body-sm" color="muted-1" className="mt-8 text-center">
          <Link href="/" className="hover:text-white/70">
            ← Back to attunr
          </Link>
        </Text>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the page renders**

Run: `npx next build --no-lint 2>&1 | tail -5`
Expected: Build succeeds

Open in browser: `http://localhost:3000/contact`
Expected: Form displays with heading, email, textarea, send button

- [ ] **Step 3: Commit**

```bash
git add src/app/contact/page.tsx
git commit -m "feat: add /contact page with feedback form"
```

---

### Task 3: Add entry point links

**Files:**
- Modify: `src/components/Footer.tsx:27-32` (add link after Manifesto)
- Modify: `src/components/SettingsPanel.tsx:207-213` (add link in About section)

- [ ] **Step 1: Add "Talk to us" link to Footer**

In `src/components/Footer.tsx`, add after the Manifesto `<Link>` (after line 32):

```tsx
          <Link
            href="/contact"
            className="hover:text-white/70 transition-colors"
          >
            Talk to us
          </Link>
```

- [ ] **Step 2: Add "Talk to us" link to SettingsPanel**

In `src/components/SettingsPanel.tsx`, add after the "What are Solfeggio frequencies?" link (after line 213), inside the About `<Section>`:

```tsx
            <Link
              href="/contact"
              onClick={onClose}
              className="cursor-pointer text-sm text-violet-400/75 hover:text-violet-400 transition-colors"
            >
              Talk to us →
            </Link>
```

- [ ] **Step 3: Verify build**

Run: `npx next build --no-lint 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.tsx src/components/SettingsPanel.tsx
git commit -m "feat: add Talk to us links in footer and settings"
```
