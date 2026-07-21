"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconTrash } from "@tabler/icons-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function DeleteAnalysisButton({ resumeId }: { resumeId: string }) {
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
        aria-label="Delete analysis"
        className="text-muted transition-colors hover:text-accent"
      >
        <IconTrash size={18} stroke={1.5} />
      </button>
      <ConfirmDialog
        open={open}
        title="Delete this analysis?"
        description="This will permanently remove the analysis and its resume. This can't be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
        confirming={deleting}
      />
    </>
  );
}
