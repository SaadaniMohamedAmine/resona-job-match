export function SkeletonHistory() {
  return (
    <div>
      {/* Header */}
      <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="mb-3 h-8 w-56 rounded bg-track" />
          <div className="h-4 w-80 max-w-full rounded bg-track opacity-60" />
        </div>
        <div className="h-11 w-40 rounded-(--radius-control) bg-track" />
      </div>

      {/* Stats */}
      <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="flex h-40 flex-col justify-between rounded-(--radius-card) border border-track p-8 md:col-span-8">
          <div className="h-3 w-32 rounded bg-track opacity-60" />
          <div className="h-12 w-24 rounded bg-track" />
        </div>
        <div className="flex h-40 flex-col items-center justify-center gap-4 rounded-(--radius-card) border border-track p-8 md:col-span-4">
          <div className="size-20 rounded-full bg-track" />
          <div className="h-3 w-24 rounded bg-track opacity-60" />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <div className="h-11 flex-1 rounded-(--radius-control) bg-track opacity-60" />
        <div className="h-11 w-40 rounded-(--radius-control) bg-track opacity-60" />
      </div>

      {/* Resume cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col justify-between rounded-(--radius-card) border border-track p-6">
            <div>
              <div className="mb-4 flex items-start justify-between">
                <div className="size-12 rounded-full bg-track" />
                <div className="h-3 w-20 rounded bg-track opacity-60" />
              </div>
              <div className="mb-2 h-5 w-4/5 rounded bg-track" />
              <div className="mb-6 h-4 w-2/5 rounded bg-track opacity-60" />
            </div>
            <div className="flex items-center justify-between border-t border-track pt-4">
              <div className="h-3 w-24 rounded bg-track opacity-60" />
              <div className="size-4 rounded bg-track opacity-60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
