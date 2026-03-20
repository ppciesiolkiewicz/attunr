"use client";

import { useState, useEffect } from "react";

/**
 * Detects whether the default/active microphone is a Bluetooth device (e.g. AirPods).
 * Uses `enumerateDevices` — no mic permission needed if already granted,
 * but labels may be empty if permission hasn't been granted yet.
 */
export function useBluetoothMic() {
  const [isBluetoothMic, setIsBluetoothMic] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter((d) => d.kind === "audioinput");

        // If labels are available (permission granted), check for Bluetooth keywords
        const btKeywords = /bluetooth|airpods|wireless|beats\s/i;
        const hasBluetooth = audioInputs.some((d) => btKeywords.test(d.label));

        // If there's a Bluetooth input and it's the default (or only) device, warn
        if (!cancelled) {
          // On most systems, the first audioinput is the default.
          // If any Bluetooth device is present and is the default, flag it.
          const defaultDevice = audioInputs.find((d) => d.deviceId === "default") ?? audioInputs[0];
          const defaultIsBt = defaultDevice && btKeywords.test(defaultDevice.label);

          setIsBluetoothMic(hasBluetooth && (defaultIsBt || audioInputs.length === 1));
        }
      } catch {
        // enumerateDevices not supported or failed — ignore
      }
    }

    check();

    // Re-check when devices change (e.g. AirPods connected/disconnected)
    const handler = () => check();
    navigator.mediaDevices?.addEventListener("devicechange", handler);

    return () => {
      cancelled = true;
      navigator.mediaDevices?.removeEventListener("devicechange", handler);
    };
  }, []);

  return isBluetoothMic;
}
