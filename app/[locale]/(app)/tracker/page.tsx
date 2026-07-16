"use client";

import { useEffect, useState } from "react";

type Application = {
  id: string;
  company: string;
  role: string;
  status: "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
};

const COLUMNS: { key: Application["status"]; label: string }[] = [
  { key: "APPLIED", label: "Applied" },
  { key: "INTERVIEW", label: "Interview" },
  { key: "OFFER", label: "Offer" },
  { key: "REJECTED", label: "Rejected" },
];

export default function TrackerPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/applications")
      .then((res) => res.json())
      .then((data) => {
        setApplications(data.applications || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-sm text-[var(--color-muted)]">Loading…</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-base-light)]">
          Nothing tracked yet
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Add your first application to start tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="mb-8 font-[family-name:var(--font-display)] text-2xl text-[var(--color-base-light)]">
        Application tracker
      </h1>
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.key}>
            <h3 className="mb-3 text-sm font-medium text-[var(--color-muted)]">{col.label}</h3>
            <div className="flex flex-col gap-3">
              {applications
                .filter((a) => a.status === col.key)
                .map((a) => (
                  <div
                    key={a.id}
                    className="rounded-[var(--radius-card)] border border-[var(--color-track)] p-4"
                  >
                    <p className="text-sm text-[var(--color-base-light)]">{a.role}</p>
                    <p className="mt-0.5 text-xs text-[var(--color-muted)]">{a.company}</p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
