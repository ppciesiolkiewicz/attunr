type TextVariant =
  | "heading-lg"
  | "heading"
  | "heading-sm"
  | "body"
  | "body-sm"
  | "caption"
  | "label";

type TextElement = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "label";

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  as?: TextElement;
}

const variantStyles: Record<TextVariant, string> = {
  "heading-lg": "text-2xl font-semibold text-white",
  heading: "text-xl font-semibold text-white",
  "heading-sm": "text-lg font-semibold text-white",
  body: "text-base text-white/85 leading-relaxed",
  "body-sm": "text-sm text-white/70 leading-relaxed",
  caption: "text-xs text-white/45",
  label: "text-xs uppercase tracking-widest font-medium text-white/40",
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
  className = "",
  ...props
}: TextProps) {
  const Tag = as ?? defaultTag[variant];
  return <Tag className={`${variantStyles[variant]} ${className}`} {...props} />;
}
