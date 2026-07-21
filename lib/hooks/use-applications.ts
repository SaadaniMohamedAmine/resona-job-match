"use client";

import { useEffect, useState } from "react";

export type ApplicationStatus = "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";

export type Application = {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedAt: string;
  interviewAt: string | null;
  analysis: { id: string; matchScore: number } | null;
};

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  async function refetch() {
    const res = await fetch("/api/applications");
    const data = await res.json();
    setApplications(data.applications ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetch("/api/applications")
      .then((res) => res.json())
      .then((data) => {
        setApplications(data.applications ?? []);
        setLoading(false);
      });
  }, []);

  async function updateStatus(id: string, status: ApplicationStatus) {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) await refetch();
  }

  async function updateInterviewDate(id: string, interviewAt: string) {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, interviewAt } : a)));

    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interviewAt }),
    });

    if (!res.ok) await refetch();
  }

  async function addApplication(input: { company: string; role: string; analysisId?: string }) {
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (res.ok) {
      setApplications((prev) => [{ ...data.application, analysis: null }, ...prev]);
    }
  }

  async function deleteApplication(id: string) {
    const previous = applications;
    setApplications((prev) => prev.filter((a) => a.id !== id));

    const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
    if (!res.ok) setApplications(previous);
  }

  return {
    applications,
    loading,
    updateStatus,
    updateInterviewDate,
    addApplication,
    deleteApplication,
    refetch,
  };
}
