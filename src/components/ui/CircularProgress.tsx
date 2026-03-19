import { useEffect, useRef } from "react";

interface CircularProgressProps {
  /** Progress value from 0 to 1 */
  progress: number;
  /** Diameter in pixels (default 80) */
  size?: number;
  /** Stroke width in pixels (default 4) */
  strokeWidth?: number;
  /** Whether to show the percentage label (default true) */
  showLabel?: boolean;
  /** Whether the task is complete — shows checkmark */
  complete?: boolean;
  /** Additional className for the wrapper */
  className?: string;
}

export function CircularProgress({
  progress,
  size = 80,
  strokeWidth = 4,
  showLabel = true,
  complete,
  className,
}: CircularProgressProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const textRef = useRef<SVGTextElement>(null);

  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const center = size / 2;

  // Direct DOM updates for smooth, frame-accurate progress
  useEffect(() => {
    if (complete) return;
    const dash = circ * Math.min(progress, 1);
    if (circleRef.current) {
      circleRef.current.style.strokeDasharray = `${dash} ${circ}`;
    }
    if (textRef.current) {
      textRef.current.textContent = `${Math.round(progress * 100)}%`;
    }
  }, [progress, circ, complete]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
    >
      {/* Track */}
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={strokeWidth}
      />
      {/* Fill */}
      <circle
        ref={circleRef}
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke="#7c3aed"
        strokeWidth={strokeWidth}
        strokeDasharray={complete ? `${circ} ${circ}` : `${circ * Math.min(progress, 1)} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
      />
      {complete ? (
        <path
          d={`M${center * 0.65} ${center * 1.02}l${center * 0.2} ${center * 0.2} ${center * 0.44}-${center * 0.44}`}
          fill="none"
          stroke="#a78bfa"
          strokeWidth={strokeWidth * 0.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : showLabel ? (
        <text
          ref={textRef}
          x={center}
          y={center + size * 0.06}
          textAnchor="middle"
          fontSize={size * 0.22}
          fill="rgba(255,255,255,0.75)"
          fontFamily="system-ui"
        >
          {Math.round(progress * 100)}%
        </text>
      ) : null}
    </svg>
  );
}
