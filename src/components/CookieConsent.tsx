"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const EU_COUNTRY_CODES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE",
  // EEA
  "IS", "LI", "NO",
  // UK (UK GDPR)
  "GB", "UK",
]);

const CONSENT_KEY = "attunr.cookieConsent";
const CHECK_KEY = "attunr.euCheckDone";

type ConsentState = "pending" | "accepted" | "declined" | "unknown";

export default function CookieConsent() {
  const [state, setState] = useState<ConsentState>("unknown");

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY) as ConsentState | null;
    if (stored === "accepted" || stored === "declined") {
      setState(stored);
      return;
    }

    const checkDone = sessionStorage.getItem(CHECK_KEY);
    if (checkDone) {
      setState("pending");
      return;
    }

    fetch("https://get.geojs.io/v1/ip/geo.json")
      .then((res) => res.json())
      .then((data) => {
        const countryCode = (data.country_code as string)?.toUpperCase();
        if (countryCode && EU_COUNTRY_CODES.has(countryCode)) {
          setState("pending");
        } else {
          setState("accepted"); // Non-EU: no banner needed
        }
      })
      .catch(() => {
        setState("pending"); // On error, show banner to be safe
      })
      .finally(() => {
        sessionStorage.setItem(CHECK_KEY, "1");
      });
  }, []);

  if (state !== "pending") return null;

  function handleAccept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setState("accepted");
  }

  function handleDecline() {
    localStorage.setItem(CONSENT_KEY, "declined");
    setState("declined");
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 fade-in"
      style={{
        background: "rgba(15,15,26,0.98)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.3)",
      }}
    >
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-white/70 flex-1">
          We use cookies and similar technologies to help the app work (e.g.
          remembering your settings). By continuing, you accept our use of
          cookies.{" "}
          <Link
            href="/privacy"
            className="text-violet-400 hover:text-violet-300 underline"
          >
            Privacy policy
          </Link>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white/80 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              boxShadow: "0 0 12px rgba(124,58,237,0.3)",
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
