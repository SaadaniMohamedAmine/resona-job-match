"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { notify } from "@/lib/toast";

export type ApplicationStatus = "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";

const STATUS_KEYS: Record<ApplicationStatus, string> = {
  APPLIED: "columnApplied",
  INTERVIEW: "columnInterview",
  OFFER: "columnOffer",
  REJECTED: "columnRejected",
};

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
  const t = useTranslations("tracker");
  const tNotify = useTranslations("notifications");
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

    if (!res.ok) {
      await refetch();
      notify.error(tNotify("generic"));
      return;
    }
    notify.success(tNotify("statusChanged", { status: t(STATUS_KEYS[status]) }));
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
      notify.success(tNotify("applicationAdded"));
    } else {
      notify.error(tNotify("generic"));
    }
  }

  async function deleteApplication(id: string) {
    const previous = applications;
    setApplications((prev) => prev.filter((a) => a.id !== id));

    const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setApplications(previous);
      notify.error(tNotify("generic"));
      return;
    }
    notify.info(tNotify("applicationRemoved"));
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
