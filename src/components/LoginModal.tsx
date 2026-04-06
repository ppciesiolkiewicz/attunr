"use client";

import { useState } from "react";
import { Modal, Button, Text, CloseButton } from "@/components/ui";

function friendlyError(msg: string): string {
  if (/rate.?limit/i.test(msg)) {
    return "Too many attempts — please wait 60 seconds before trying again.";
  }
  if (/token.*(expired|invalid)/i.test(msg) || /otp.*(expired|invalid)/i.test(msg)) {
    return "That code has expired or is invalid. Please request a new one.";
  }
  return msg;
}

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSignIn: (email: string) => Promise<{ error: Error | null }>;
  onVerifyOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
}

export function LoginModal({ open, onClose, onSignIn, onVerifyOtp }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await onSignIn(email);
    setLoading(false);

    if (error) {
      setError(friendlyError(error.message));
    } else {
      setStep("code");
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await onVerifyOtp(email, code.trim());
    setLoading(false);

    if (error) {
      setError(friendlyError(error.message));
    } else {
      handleClose();
    }
  }

  function handleClose() {
    setEmail("");
    setCode("");
    setStep("email");
    setError(null);
    setLoading(false);
    onClose();
  }

  if (!open) return null;

  return (
    <Modal>
      <div className="p-6 flex flex-col gap-4 relative">
        <CloseButton onClick={handleClose} className="absolute top-3 right-3" />
        {step === "email" && (
          <>
            <Text variant="heading-sm">Log in to Attunr</Text>
            <Text variant="body-sm" color="muted-1">
              We&apos;ll send you a magic link and a login code.
            </Text>
            <form onSubmit={handleSendLink} className="flex flex-col gap-3">
              <input
                type="email"
                name="email"
                autoComplete="email"
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

        {step === "code" && (
          <>
            <Text variant="heading-sm">Enter your code</Text>
            <Text variant="body-sm" color="muted-1">
              We sent a code to <strong>{email}</strong>.
              <br />
              You can also click the magic link in the email.
            </Text>
            <form onSubmit={handleVerifyCode} className="flex flex-col gap-3">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="00000000"
                maxLength={8}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder-white/30 text-lg text-center tracking-[0.3em] font-mono focus:outline-none focus:border-violet-500/50 transition-colors"
              />
              {error && (
                <Text variant="caption" color="error">
                  {error}
                </Text>
              )}
              <Button type="submit" disabled={loading || code.length < 6}>
                {loading ? "Verifying…" : "Verify code"}
              </Button>
              <button
                type="button"
                className="text-sm text-white/40 hover:text-white/60 transition-colors cursor-pointer"
                onClick={() => { setStep("email"); setCode(""); setError(null); }}
              >
                Use a different email
              </button>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}
