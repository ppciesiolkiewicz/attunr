export type TextVariant =
  | "heading-lg"
  | "heading"
  | "heading-sm"
  | "body"
  | "body-sm"
  | "caption"
  | "label";

export type TextColor =
  | "text-1"     // text-white — headings, hero, important
  | "text-2"     // text-white/72 — body, readable content
  | "muted-1"    // text-white/48 — captions, labels, metadata
  | "muted-2"    // text-white/28 — separators, decorative
  | "accent"     // text-violet-400 — brand highlights
  | "warning"    // text-amber-400 — caution notices
  | "error"      // text-red-400 — error messages
  | "note-low"       // red — lowest slot color
  | "note-mid-low"   // orange
  | "note-mid"       // green — middle slot
  | "note-mid-high"  // blue
  | "note-high";     // indigo/violet — highest slot color

type TextElement = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "label" | "div" | "li";

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  as?: TextElement;
  /** Named color override. Defaults per variant. Auto-suppressed when style.color is set. */
  color?: TextColor;
}

const variantTypography: Record<TextVariant, string> = {
  "heading-lg": "text-2xl font-semibold",
  heading: "text-xl font-semibold",
  "heading-sm": "text-lg font-semibold",
  body: "text-base leading-relaxed",
  "body-sm": "text-sm leading-relaxed",
  caption: "text-xs",
  label: "text-xs uppercase tracking-widest font-medium",
};

const colorValues: Record<TextColor, string> = {
  "text-1": "text-white",
  "text-2": "text-white/72",
  "muted-1": "text-white/48",
  "muted-2": "text-white/28",
  accent: "text-violet-400",
  warning: "text-amber-400",
  error: "text-red-400",
  "note-low": "text-red-400",
  "note-mid-low": "text-orange-400",
  "note-mid": "text-green-400",
  "note-mid-high": "text-blue-400",
  "note-high": "text-indigo-400",
};

const defaultColor: Record<TextVariant, TextColor> = {
  "heading-lg": "text-1",
  heading: "text-1",
  "heading-sm": "text-1",
  body: "text-1",
  "body-sm": "text-2",
  caption: "muted-1",
  label: "muted-1",
};

const defaultTag: Record<TextVariant, TextElement> = {
  "heading-lg": "h1",
  heading: "h2",
  "heading-sm": "h3",
  body: "p",
  "body-sm": "p",
  caption: "p",
  label: "p",
};

export function Text({
  variant = "body-sm",
  as,
  color,
  className = "",
  style,
  ...props
}: TextProps) {
  const Tag = as ?? defaultTag[variant];
  const hasStyleColor = style?.color != null;
  const colorClass = hasStyleColor ? "" : colorValues[color ?? defaultColor[variant]];
  return (
    <Tag
      className={`${variantTypography[variant]} ${colorClass} ${className}`}
      style={style}
      {...props}
    />
  );
}
