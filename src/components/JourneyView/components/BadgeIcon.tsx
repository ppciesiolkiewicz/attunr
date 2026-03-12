interface BadgeIconProps {
  className?: string;
  style?: React.CSSProperties;
}

export function BadgeIcon({ className, style }: BadgeIconProps) {
  return (
    <svg
      className={className}
      style={style}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2l3 7h7l-5.5 5 2 7-6.5-4.5L5.5 21l2-7-5.5-5h7z" />
    </svg>
  );
}
