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
            <Link href="/journey" className="hover:text-white/70">
              Continue your journey →
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
          <Link href="/journey" className="hover:text-white/70">
            Continue your journey →
          </Link>
        </Text>
      </div>
    </div>
  );
}
