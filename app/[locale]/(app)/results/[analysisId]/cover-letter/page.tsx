import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CoverLetterModal } from "@/components/cover-letter-modal";

export default async function CoverLetterPage({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { analysisId } = await params;
  const analysis = await db.analysis.findUnique({
    where: { id: analysisId },
    select: { userId: true, jobPost: { select: { title: true, company: true } } },
  });
  if (!analysis || analysis.userId !== session.user.id) notFound();

  return (
    <CoverLetterModal
      analysisId={analysisId}
      jobTitle={analysis.jobPost.title}
      company={analysis.jobPost.company}
    />
  );
}
