export function SkeletonDashboard() {
  return (
    <div className="rounded-(--radius-card) border border-track bg-track/10 p-8">
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="h-24 rounded-(--radius-control) bg-track" />
        <div className="h-24 rounded-(--radius-control) bg-track" />
        <div className="h-24 rounded-(--radius-control) bg-track" />
      </div>
      <div className="mb-6 h-48 w-full rounded-(--radius-control) bg-track" />
      <div className="space-y-4">
        <div className="h-4 w-3/4 rounded bg-track" />
        <div className="h-4 w-1/2 rounded bg-track" />
      </div>
    </div>
  );
}
