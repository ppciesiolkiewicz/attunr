import { useRef, useEffect, useCallback } from "react";

/**
 * Manages a requestAnimationFrame loop that fully stops when the tab is hidden
 * and restarts when visible again. On resume, calls `onResume` so components
 * can flush stale timestamps (trails, dots).
 *
 * Returns `startLoop` — call it once (in a useEffect) to kick off the loop.
 * Cleanup is automatic.
 */
export function useAnimationLoop(
  render: () => void,
  onResume: () => void,
) {
  const rafRef = useRef<number | null>(null);
  const renderRef = useRef(render);
  const onResumeRef = useRef(onResume);

  renderRef.current = render;
  onResumeRef.current = onResume;

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const loop = useCallback(() => {
    renderRef.current();
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const start = useCallback(() => {
    stop();
    rafRef.current = requestAnimationFrame(loop);
  }, [stop, loop]);

  useEffect(() => {
    const handler = () => {
      if (document.hidden) {
        stop();
      } else {
        onResumeRef.current();
        start();
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => {
      document.removeEventListener("visibilitychange", handler);
      stop();
    };
  }, [start, stop]);

  return start;
}
