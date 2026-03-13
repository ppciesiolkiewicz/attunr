interface CloseButtonProps {
  onClick: () => void;
  className?: string;
}

export function CloseButton({ onClick, className = "" }: CloseButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Close"
      className={`cursor-pointer text-white/55 hover:text-white/82 transition-colors text-xl leading-none ${className}`}
    >
      ✕
    </button>
  );
}
