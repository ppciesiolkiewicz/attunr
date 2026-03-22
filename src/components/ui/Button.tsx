import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "cursor-pointer transition-all duration-150 hover:brightness-125 active:brightness-90 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:brightness-100",
  {
    variants: {
      variant: {
        solid: "border border-transparent",
        outline: "border",
        ghost: "border border-transparent",
        icon: "p-2.5 rounded-full flex items-center justify-center",
        "icon-outline": "p-2.5 rounded-full flex items-center justify-center border",
        landing: "border border-transparent",
      },
      size: {
        sm: "px-4 py-2 text-sm font-medium rounded-lg",
        md: "px-5 py-2.5 text-sm font-medium rounded-xl",
        lg: "px-8 py-4 text-base font-semibold rounded-xl",
        compact: "py-2.5 px-3 text-xs font-semibold rounded-none",
      },
      color: {
        primary: "text-white",
        secondary: "bg-violet-600 text-white hover:bg-violet-500",
        muted: "text-white/40 hover:text-white/60",
        accent: "text-[#a78bfa] hover:text-[#c4b5fd]",
        subtle: "text-white/65 hover:text-white/95",
      },
    },
    compoundVariants: [
      { variant: "outline", color: "primary", className: "border-white/20 text-white/68 hover:text-white/90 hover:border-white/30" },
      { variant: "ghost", color: "primary", className: "text-white/70 hover:text-white/85" },
      { variant: "icon", color: "subtle", className: "hover:bg-white/[0.08]" },
      { variant: "icon-outline", color: "subtle", className: "border-white/20 hover:bg-white/[0.08] hover:border-white/30" },
    ],
    defaultVariants: {
      variant: "solid",
      size: "md",
      color: "primary",
    },
  },
);

const primaryGlow: Record<string, string> = {
  sm: "0 0 12px rgba(124,58,237,0.3)",
  md: "0 0 16px rgba(124,58,237,0.3)",
  lg: "0 0 28px rgba(124,58,237,0.35)",
  compact: "0 0 16px rgba(124,58,237,0.3)",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

const landingStyle: React.CSSProperties = {
  fontFamily: '"Fraunces", Georgia, serif',
  letterSpacing: "0.08em",
  fontSize: "0.95rem",
  background:
    "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(99,102,241,0.15))",
  border: "1px solid rgba(139,92,246,0.5)",
  color: "#e0d4ff",
  boxShadow:
    "0 0 30px rgba(139,92,246,0.2), 0 0 60px rgba(139,92,246,0.1), inset 0 1px 0 rgba(255,255,255,0.1)",
  transition:
    "transform 0.3s ease, box-shadow 0.4s ease, background 0.4s ease, border-color 0.4s ease",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "solid", size = "md", color = "primary", className = "", style, ...props }, ref) => {
    const isIcon = variant === "icon" || variant === "icon-outline";
    const isLanding = variant === "landing";
    const isSolidPrimary = variant === "solid" && color === "primary";

    return (
      <button
        ref={ref}
        className={`${buttonVariants({ variant, size: isIcon ? null : size, color: isLanding ? null : color })} ${className}`}
        style={
          isLanding
            ? { ...landingStyle, ...style }
            : isSolidPrimary
              ? {
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  boxShadow: primaryGlow[size ?? "md"],
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
export { buttonVariants };
