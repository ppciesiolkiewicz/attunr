"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isNative } from "@/lib/platform";

/**
 * Immediately redirects to /journey on native platforms.
 * Placed in the home page to prevent the landing page from ever showing in the app.
 */
export function NativeRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (isNative()) {
      router.replace("/journey");
    }
  }, [router]);

  return null;
}
