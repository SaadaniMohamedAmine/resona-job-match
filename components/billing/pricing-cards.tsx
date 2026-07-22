"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconCheck } from "@tabler/icons-react";

type Plan = "FREE" | "PRO";

function buildPlans(proPrice: string) {
  return [
    {
      id: "FREE" as const,
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Try Résona and see your first match score.",
      features: ["3 analyses per month", "Match score & gap detection", "5 saved analyses"],
    },
    {
      id: "PRO" as const,
      name: "Pro",
      price: proPrice,
      period: "/ month",
      description: "For an active job search, without limits.",
      features: [
        "Unlimited analyses",
        "AI section rewriting",
        "Cover letter generation",
        "Unlimited history",
        "PDF export",
      ],
      highlighted: true,
    },
  ];
}

export function PricingCards({
  currentPlan,
  isAuthenticated,
  proPrice,
  locale,
}: {
  currentPlan: Plan | null;
  isAuthenticated: boolean;
  proPrice: string;
  locale: string;
}) {
  const PLANS = buildPlans(proPrice);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-3xl grid-cols-1 gap-8 md:grid-cols-2">
      {PLANS.map((plan) => {
        const isCurrent = currentPlan !== null && currentPlan === plan.id;
        return (
          <div
            key={plan.id}
            className={`rounded-(--radius-card) border p-8 ${
              plan.highlighted ? "border-accent/30 bg-accent/5" : "border-track bg-track/10"
            }`}
          >
            {plan.highlighted && (
              <span className="mb-4 inline-block rounded-(--radius-control) bg-accent px-3 py-1 text-xs font-medium tracking-widest text-[var(--color-base)] uppercase">
                Most popular
              </span>
            )}
            <h2 className="font-display text-xl font-bold text-base-light">{plan.name}</h2>
            <p className="mt-2 text-sm text-muted">{plan.description}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-display text-4xl font-bold text-base-light">{plan.price}</span>
              <span className="text-sm text-muted">{plan.period}</span>
            </div>
            <ul className="mt-8 flex flex-col gap-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-base-light">
                  <IconCheck size={16} stroke={1.5} className="text-accent" />
                  {f}
                </li>
              ))}
            </ul>

            {plan.id === "FREE" ? (
              currentPlan === "PRO" ? (
                <form action="/api/stripe/portal" method="POST" className="mt-8">
                  <input type="hidden" name="locale" value={locale} />
                  <button className="w-full rounded-(--radius-control) border border-track py-3 text-sm text-base-light transition-colors hover:bg-track">
                    Downgrade
                  </button>
                </form>
              ) : (
                <button
                  disabled
                  className="mt-8 w-full cursor-not-allowed rounded-(--radius-control) border border-track py-3 text-sm text-muted opacity-60"
                >
                  {isCurrent ? "Current plan" : "Included"}
                </button>
              )
            ) : isCurrent ? (
              <button
                disabled
                className="mt-8 w-full cursor-not-allowed rounded-(--radius-control) bg-accent/40 py-3 text-sm font-medium text-[var(--color-base)] opacity-70"
              >
                Current plan
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="mt-8 w-full rounded-(--radius-control) bg-accent py-3 text-sm font-bold text-[var(--color-base)] transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {loading ? "Redirecting…" : "Upgrade to Pro"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
