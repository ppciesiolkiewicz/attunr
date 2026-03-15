"use client";

import { useEffect, useRef, useState } from "react";

export function useServiceWorker() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const attempted = useRef(false);

  const isSupported =
    typeof window !== "undefined" && "serviceWorker" in navigator;

  useEffect(() => {
    if (!isSupported || attempted.current) return;
    attempted.current = true;

    navigator.serviceWorker
      .register("/sw.js")
      .then(setRegistration)
      .catch(() => {
        // SW registration failed — notifications will still work via Notification API
      });
  }, [isSupported]);

  return { registration, isSupported };
}
