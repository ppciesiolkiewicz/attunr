import { forwardRef, type InputHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const sliderVariants = cva(
  [
    "appearance-none bg-white/10 rounded-full outline-none cursor-pointer transition-opacity",
    "disabled:opacity-40 disabled:cursor-not-allowed",
    // Thumb — WebKit & Firefox
    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-400 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_4px_rgba(139,92,246,0.4)]",
    "[&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-violet-400 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-1",
        md: "h-1.5",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  },
);

type SliderProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> &
  VariantProps<typeof sliderVariants> & {
    min: number;
    max: number;
  };

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, size, ...props }, ref) => (
    <input
      ref={ref}
      type="range"
      className={sliderVariants({ size, className })}
      {...props}
    />
  ),
);

Slider.displayName = "Slider";
