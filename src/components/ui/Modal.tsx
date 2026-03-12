interface ModalProps {
  children: React.ReactNode;
  onBackdropClick?: () => void;
  className?: string;
  panelClassName?: string;
  style?: React.CSSProperties;
  panelStyle?: React.CSSProperties;
}

export function Modal({
  children,
  onBackdropClick,
  className = "",
  panelClassName = "",
  style,
  panelStyle,
}: ModalProps) {
  return (
    <div
      className={`fixed inset-0 z-30 flex items-end sm:items-center justify-center p-4 ${className}`}
      style={{
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        ...style,
      }}
      onClick={onBackdropClick}
    >
      <div
        className={`w-full max-w-md rounded-2xl overflow-hidden flex flex-col ${panelClassName}`}
        style={{
          background: "#0f0f1a",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          maxHeight: "90vh",
          ...panelStyle,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
