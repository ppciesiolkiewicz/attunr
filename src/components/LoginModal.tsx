"use client";

import { useState } from "react";
import { Modal, Button, Text } from "@/components/ui";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSignIn: (email: string) => Promise<{ error: Error | null }>;
}

export function LoginModal({ open, onClose, onSignIn }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await onSignIn(email);
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  function handleClose() {
    setEmail("");
    setSent(false);
    setError(null);
    setLoading(false);
    onClose();
  }

  return (
    <Modal onBackdropClick={handleClose}>
      <div className="p-6 flex flex-col gap-4">
        {sent ? (
          <>
            <Text variant="heading-sm">Check your email</Text>
            <Text variant="body-sm">
              We sent a magic link to <strong>{email}</strong>. Click the link
              to sign in.
            </Text>
            <Button variant="ghost" color="subtle" onClick={handleClose}>
              Close
            </Button>
          </>
        ) : (
          <>
            <Text variant="heading-sm">Log in to Attunr</Text>
            <Text variant="body-sm" color="muted-1">
              We&apos;ll send you a magic link — no password needed.
            </Text>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
              />
              {error && (
                <Text variant="caption" color="error">
                  {error}
                </Text>
              )}
              <Button type="submit" disabled={loading || !email}>
                {loading ? "Sending…" : "Send magic link"}
              </Button>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}
