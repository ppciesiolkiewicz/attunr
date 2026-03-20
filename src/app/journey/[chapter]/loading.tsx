export default function ChapterLoading() {
  return (
    <div className="h-full overflow-y-auto animate-pulse">
      <div className="flex flex-col gap-4 px-5 py-5 max-w-2xl mx-auto w-full">
        {/* Back link */}
        <div className="h-4 w-16 rounded bg-white/8" />

        {/* Chapter header */}
        <div className="flex flex-col gap-2">
          <div className="h-3 w-20 rounded bg-white/8" />
          <div className="h-6 w-48 rounded bg-white/10" />
          <div className="h-4 w-64 rounded bg-white/6" />
        </div>

        {/* Action button */}
        <div className="h-9 w-28 rounded-lg bg-white/8" />

        {/* Exercise cards */}
        <div className="flex flex-col gap-3 mt-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-14 rounded-lg bg-white/6" />
          ))}
        </div>
      </div>
    </div>
  );
}
