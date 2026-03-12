interface CloseButtonProps {
  onClick: () => void;
  className?: string;
}

export function CloseButton({ onClick, className = "" }: CloseButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Close"
      className={`text-white/45 hover:text-white/75 transition-colors text-xl leading-none ${className}`}
    >
      ✕
    </button>
  );
}
