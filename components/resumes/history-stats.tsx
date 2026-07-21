import { ScoreRing } from "@/components/ui/score-ring";

export function HistoryStats({
  totalThisMonth,
  recent,
  mid,
  old,
  avgScore,
}: {
  totalThisMonth: number;
  recent: number;
  mid: number;
  old: number;
  avgScore: number;
}) {
  const max = Math.max(1, recent, mid, old);

  return (
    <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-12">
      <div className="flex flex-col justify-between rounded-(--radius-card) border border-track p-8 md:col-span-8">
        <div>
          <h2 className="mb-4 text-xs tracking-widest text-muted uppercase">Total Impact</h2>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-6xl font-bold text-accent">{totalThisMonth}</span>
            <span className="text-muted">Analyses completed this month</span>
          </div>
        </div>
        <div className="mt-8 flex gap-1">
          <div
            className="h-1 rounded-full bg-accent transition-all"
            style={{ width: `${(recent / max) * 100}%` }}
          />
          <div
            className="h-1 rounded-full bg-accent opacity-50 transition-all"
            style={{ width: `${(mid / max) * 100}%` }}
          />
          <div
            className="h-1 rounded-full bg-accent opacity-20 transition-all"
            style={{ width: `${(old / max) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center rounded-(--radius-card) border border-track p-8 text-center md:col-span-4">
        <div className="relative mb-4">
          <ScoreRing score={avgScore} size={128} showLabel={false} />
          <span className="absolute inset-0 flex items-center justify-center font-display text-2xl font-bold text-accent">
            {avgScore}
          </span>
        </div>
        <p className="text-xs tracking-widest text-muted uppercase">Average Score</p>
      </div>
    </div>
  );
}
