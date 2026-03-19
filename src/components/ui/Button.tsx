import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "icon";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm font-medium rounded-lg",
  md: "px-5 py-2.5 text-sm font-medium rounded-xl",
  lg: "px-8 py-4 text-base font-semibold rounded-xl",
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary:
    "bg-violet-600 text-white hover:bg-violet-500",
  outline:
    "border border-white/20 text-white/68 hover:text-white/90 hover:border-white/30",
  ghost: "text-white/70 hover:text-white/85",
  icon: "p-2.5 rounded-full flex items-center justify-center text-white/65 hover:text-white/95 hover:bg-white/[0.08]",
};

const primaryGlow: Record<ButtonSize, string> = {
  sm: "0 0 12px rgba(124,58,237,0.3)",
  md: "0 0 16px rgba(124,58,237,0.3)",
  lg: "0 0 28px rgba(124,58,237,0.35)",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", className = "", style, ...props },
    ref,
  ) => {
    const isIcon = variant === "icon";
    const isPrimary = variant === "primary";

    return (
      <button
        ref={ref}
        className={`cursor-pointer transition-all disabled:opacity-70 disabled:cursor-not-allowed ${variantStyles[variant]} ${isIcon ? "" : sizeStyles[size]} ${className}`}
        style={
          isPrimary
            ? {
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                boxShadow: primaryGlow[size],
                ...style,
              }
            : style
        }
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
