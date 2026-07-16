"use client";

import { useParams, useRouter } from "next/navigation";
import { CoverLetterModal } from "@/components/cover-letter-modal";

export default function CoverLetterPage() {
  const { analysisId } = useParams<{ analysisId: string }>();
  const router = useRouter();

  return <CoverLetterModal analysisId={analysisId} onClose={() => router.back()} />;
}
