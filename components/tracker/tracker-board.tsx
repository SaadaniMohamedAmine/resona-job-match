"use client";

import { useState } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { useTranslations } from "next-intl";
import { IconPlus } from "@tabler/icons-react";
import { useApplications, type ApplicationStatus } from "@/lib/hooks/use-applications";
import { TrackerColumn } from "./tracker-column";
import { TrackerEmptyState } from "./tracker-empty-state";
import { AddApplicationModal } from "./add-application-modal";
import { LoaderRing } from "@/components/ui/loader-ring";

const STATUSES: ApplicationStatus[] = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

export function TrackerBoard() {
  const t = useTranslations("tracker");
  const { applications, loading, updateStatus, updateInterviewDate, addApplication, deleteApplication } =
    useApplications();
  const [modalOpen, setModalOpen] = useState(false);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const newStatus = over.id as ApplicationStatus;
    const application = applications.find((a) => a.id === active.id);
    if (application && application.status !== newStatus) {
      updateStatus(application.id, newStatus);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoaderRing size={32} />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <>
        <TrackerEmptyState onAdd={() => setModalOpen(true)} />
        <AddApplicationModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={addApplication} />
      </>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-16">
      <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-3xl font-bold text-base-light md:text-4xl">{t("title")}</h1>
          <p className="mt-2 text-muted">{t("pageSubtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-(--radius-control) bg-accent px-6 py-3 text-sm font-medium text-[var(--color-base)] transition-opacity hover:opacity-90"
        >
          <IconPlus size={18} stroke={1.5} />
          {t("addApplication")}
        </button>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STATUSES.map((status) => (
            <TrackerColumn
              key={status}
              status={status}
              applications={applications.filter((a) => a.status === status)}
              onSetInterviewDate={updateInterviewDate}
              onDelete={deleteApplication}
            />
          ))}
        </div>
      </DndContext>

      <AddApplicationModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={addApplication} />
    </div>
  );
}
