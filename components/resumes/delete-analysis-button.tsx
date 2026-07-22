"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { IconTrash } from "@tabler/icons-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function DeleteAnalysisButton({ resumeId }: { resumeId: string }) {
  const t = useTranslations("history");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    await fetch(`/api/resumes/${resumeId}`, { method: "DELETE" });
    setDeleting(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("deleteAriaLabel")}
        className="text-muted transition-colors hover:text-accent"
      >
        <IconTrash size={18} stroke={1.5} />
      </button>
      <ConfirmDialog
        open={open}
        title={t("deleteTitle")}
        description={t("deleteDescription")}
        confirmLabel={t("deleteCta")}
        cancelLabel={t("cancelCta")}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
        confirming={deleting}
      />
    </>
  );
}
