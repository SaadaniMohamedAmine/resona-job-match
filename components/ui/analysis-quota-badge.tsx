import Link from "next/link";
import { IconBolt } from "@tabler/icons-react";

export function AnalysisQuotaBadge({
  plan,
  remaining,
  limit,
}: {
  plan: "FREE" | "PRO";
  remaining: number;
  limit: number;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-(--radius-control) border border-track px-4 py-3 text-sm sm:flex-row sm:justify-between">
      <div className="flex items-center gap-2 text-muted">
        <IconBolt size={16} stroke={1.5} className="text-accent" />
        <span>
          <span className="font-medium text-base-light">{remaining}</span> of {limit} analyses
          remaining this month · {plan === "PRO" ? "Pro" : "Free"} plan
        </span>
      </div>
      {plan === "FREE" && remaining === 0 && (
        <Link href="/pricing" className="text-xs font-medium text-accent hover:underline">
          Upgrade to Pro
        </Link>
      )}
    </div>
  );
}
