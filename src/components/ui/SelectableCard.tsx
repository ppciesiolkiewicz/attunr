import { forwardRef } from "react";

interface SelectableCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export const SelectableCard = forwardRef<HTMLButtonElement, SelectableCardProps>(
  ({ selected = false, className = "", style, ...props }, ref) => (
    <button
      ref={ref}
      className={`cursor-pointer flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left transition-all disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
      style={{
        backgroundColor: selected ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
        borderColor: selected ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.06)",
        ...style,
      }}
      {...props}
    />
  ),
);

SelectableCard.displayName = "SelectableCard";
