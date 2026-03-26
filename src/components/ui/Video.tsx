interface VideoProps {
  /** Video source URL. Required when not a placeholder. */
  src?: string;
  /** When true, renders a styled placeholder frame instead of a video. Default: true. */
  placeholder?: boolean;
  /** Text shown inside the placeholder frame. */
  text?: string;
}

const DEFAULT_TEXT = "Video coming soon";

export function Video({
  src,
  placeholder = true,
  text = DEFAULT_TEXT,
}: VideoProps) {
  if (!placeholder && src) {
    return (
      <video
        className="w-full rounded-xl"
        src={src}
        controls
        playsInline
      />
    );
  }

  return (
    <div
      className="rounded-xl px-5 py-8 flex flex-col items-center justify-center gap-2"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px dashed rgba(255,255,255,0.15)",
      }}
    >
      <span className="text-2xl opacity-50">{"\u25B6"}</span>
      <p className="text-sm text-white/55 font-medium">
        {text}
      </p>
    </div>
  );
}
