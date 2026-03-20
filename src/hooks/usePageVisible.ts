import { useRef, useEffect } from "react";

/**
 * Tracks page visibility state for canvas animation loops.
 *
 * Returns:
 * - `hiddenRef` — true while the tab is hidden (use to skip rendering)
 * - `resumedAtRef` — set to `performance.now()` on the first visible frame
 *   after a hide. Animation loops should use this to flush stale timestamps
 *   (trails, dots) and reset interval timers. Reset it to `0` after handling.
 */
export function usePageVisible() {
  const hiddenRef = useRef(document.hidden);
  const resumedAtRef = useRef(0);

  useEffect(() => {
    const handler = () => {
      if (document.hidden) {
        hiddenRef.current = true;
      } else {
        hiddenRef.current = false;
        resumedAtRef.current = performance.now();
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  return { hiddenRef, resumedAtRef };
}
