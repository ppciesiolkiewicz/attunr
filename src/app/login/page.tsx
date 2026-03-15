"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Text } from "@/components/ui";
import { analytics } from "@/lib/analytics";

type Step = "email" | "code";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send code");
      analytics.loginCodeSent();
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Verification failed");
      analytics.loginSucceeded();
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleCodeChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
  }

  function handleCodeKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code && step === "code") {
      setStep("email");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-12">
      <div className="w-full max-w-sm">
        <Text variant="heading-lg" className="mb-1">Log in</Text>
        <Text variant="body-sm" color="text-2" className="mb-8">
          Enter your email and we&apos;ll send you a one-time code.
        </Text>

        {step === "email" ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <label className="block">
              <Text as="span" variant="body-sm" color="text-2">Email</Text>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="mt-1.5 w-full px-4 py-3 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white placeholder-white/30 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                autoComplete="email"
              />
            </label>
            {error && <Text variant="body-sm" color="error">{error}</Text>}
            <Button variant="secondary" type="submit" disabled={loading} className="w-full py-3">
              {loading ? "Sending…" : "Send code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <Text variant="body-sm" color="text-2">
              Code sent to <Text as="span" variant="body-sm" color="text-1">{email}</Text>
              <Button variant="ghost" type="button" onClick={() => setStep("email")} className="ml-2 text-violet-400 hover:text-violet-300">
                Change
              </Button>
            </Text>
            <label className="block">
              <Text as="span" variant="body-sm" color="text-2">6-digit code</Text>
              <input
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                onKeyDown={handleCodeKeyDown}
                placeholder="000000"
                maxLength={6}
                className="mt-1.5 w-full px-4 py-3 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white text-center text-2xl tracking-[0.5em] placeholder-white/30 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                autoFocus
              />
            </label>
            {process.env.NODE_ENV === "development" && (
              <Text variant="caption">
                Dev: check your terminal for the code.
              </Text>
            )}
            {error && <Text variant="body-sm" color="error">{error}</Text>}
            <Button variant="secondary" type="submit" disabled={loading || code.length !== 6} className="w-full py-3">
              {loading ? "Verifying…" : "Verify"}
            </Button>
            <Button variant="ghost" type="button" onClick={() => setStep("email")} className="w-full py-2 text-sm text-white/55 hover:text-white/78">
              Use a different email
            </Button>
          </form>
        )}

        <Text variant="body-sm" color="muted-1" className="mt-8 text-center">
          <Link href="/" className="hover:text-white/70">
            ← Back to attunr
          </Link>
        </Text>
      </div>
    </div>
  );
}
