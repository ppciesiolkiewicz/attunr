"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Supabase client auto-detects the hash fragment from the magic link
    // and exchanges it for a session. We just need to wait for it.
    const supabase = createClient();

    supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.replace("/journey");
      }
    });

    // Fallback: if already signed in (session restored), redirect immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/journey");
      }
    });
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-white/60 text-sm">Signing you in…</p>
    </div>
  );
}
