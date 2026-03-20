export default function ExerciseLoading() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      {/* Sub-nav bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/6 shrink-0">
        <div className="h-4 w-16 rounded bg-white/8" />
        <div className="h-3 w-px bg-white/10" />
        <div className="h-3 w-12 rounded bg-white/8" />
        <div className="h-3 w-px bg-white/10" />
        <div className="h-3 w-20 rounded bg-white/8" />
        <div className="h-3 w-px bg-white/10" />
        <div className="h-3 w-32 rounded bg-white/8" />
      </div>

      {/* Exercise content area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-5">
        <div className="h-5 w-40 rounded bg-white/8" />
        <div className="h-32 w-full max-w-md rounded-xl bg-white/6" />
        <div className="h-10 w-32 rounded-lg bg-white/8" />
      </div>
    </div>
  );
}
