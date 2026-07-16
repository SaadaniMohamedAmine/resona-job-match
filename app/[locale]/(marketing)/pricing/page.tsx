"use client";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    features: ["3 analyses per month", "Match score & gap detection", "5 saved analyses"],
  },
  {
    name: "Pro",
    price: "$19/mo",
    features: [
      "Unlimited analyses",
      "Section rewriting",
      "Cover letter generation",
      "PDF export",
      "Unlimited history",
    ],
  },
];

export default function PricingPage() {
  async function handleUpgrade() {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 px-4 py-24 sm:grid-cols-2">
      {PLANS.map((plan) => (
        <div key={plan.name} className="rounded-[var(--radius-card)] border border-[var(--color-track)] p-8">
          <h3 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-base-light)]">
            {plan.name}
          </h3>
          <p className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--color-accent)]">
            {plan.price}
          </p>
          <ul className="mt-6 flex flex-col gap-2 text-sm text-[var(--color-muted)]">
            {plan.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          {plan.name === "Pro" && (
            <button
              onClick={handleUpgrade}
              className="mt-8 w-full rounded-[var(--radius-control)] bg-[var(--color-accent)] py-2.5 text-sm font-medium text-[var(--color-base)] transition-opacity hover:opacity-90"
            >
              Upgrade to Pro
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
