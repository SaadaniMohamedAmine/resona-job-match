export function SkeletonDashboard() {
  return (
    <div>
      {/* Header */}
      <div className="mb-16">
        <div className="mb-3 h-8 w-72 rounded bg-track" />
        <div className="h-4 w-96 max-w-full rounded bg-track opacity-60" />
      </div>

      {/* Stat cards */}
      <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex h-48 flex-col justify-between rounded-(--radius-card) border border-track p-8"
          >
            <div className="flex items-start justify-between">
              <div className="h-3 w-24 rounded bg-track" />
              <div className="size-4 rounded-full bg-track" />
            </div>
            <div className="space-y-2">
              <div className="h-9 w-20 rounded bg-track" />
              <div className="h-3 w-28 rounded bg-track opacity-60" />
            </div>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div className="mb-16 rounded-(--radius-card) border border-track p-8">
        <div className="mb-12 flex items-end justify-between">
          <div className="space-y-2">
            <div className="h-5 w-48 rounded bg-track" />
            <div className="h-3 w-56 rounded bg-track opacity-60" />
          </div>
          <div className="h-3 w-24 rounded bg-track opacity-60" />
        </div>
        <div className="h-64 w-full rounded-(--radius-control) bg-track" />
      </div>

      {/* Recent activity */}
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div className="h-5 w-40 rounded bg-track" />
          <div className="h-4 w-24 rounded bg-track opacity-60" />
        </div>
        <div className="flex flex-col gap-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col gap-4 rounded-(--radius-card) border border-track p-6 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-6">
                <div className="size-12 shrink-0 rounded-(--radius-control) bg-track" />
                <div className="space-y-2">
                  <div className="h-4 w-56 max-w-full rounded bg-track" />
                  <div className="h-3 w-40 max-w-full rounded bg-track opacity-60" />
                </div>
              </div>
              <div className="h-6 w-20 shrink-0 rounded bg-track opacity-60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
