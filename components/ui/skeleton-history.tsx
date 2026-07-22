export function SkeletonHistory() {
  return (
    <div className="rounded-(--radius-card) border border-track bg-track/10 p-8">
      <div className="space-y-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`flex items-center gap-4 py-3 ${i < 3 ? "border-b border-track/60" : ""}`}>
            <div className="size-10 shrink-0 rounded-(--radius-control) bg-track" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 rounded bg-track" />
              <div className="h-2 w-1/4 rounded bg-track opacity-60" />
            </div>
            <div className="h-4 w-16 rounded bg-track" />
          </div>
        ))}
      </div>
    </div>
  );
}
