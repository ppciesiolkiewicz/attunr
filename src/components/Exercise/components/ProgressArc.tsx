export function ProgressArc({ progress, complete }: { progress: number; complete?: boolean }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(progress, 1);
  return (
    <svg width={50} height={50} viewBox="0 0 50 50" className="shrink-0">
      <circle
        cx={25}
        cy={25}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={3}
      />
      <circle
        cx={25}
        cy={25}
        r={r}
        fill="none"
        stroke="#7c3aed"
        strokeWidth={3}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 25 25)"
        style={{ transition: "stroke-dasharray 0.3s" }}
      />
      {complete ? (
        <path
          d="M17 25.5l5 5 11-11"
          fill="none"
          stroke="#a78bfa"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <text
          x={25}
          y={29}
          textAnchor="middle"
          fontSize={13}
          fill="rgba(255,255,255,0.75)"
          fontFamily="system-ui"
        >
          {Math.round(progress * 100)}%
        </text>
      )}
    </svg>
  );
}
