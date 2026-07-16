import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("demo-password-2026", 10);

  const demoUser = await db.user.upsert({
    where: { email: "demo@resona.dev" },
    update: {},
    create: { email: "demo@resona.dev", name: "Demo User", password, plan: "PRO" },
  });

  const resume = await db.resume.create({
    data: {
      userId: demoUser.id,
      fileUrl: "https://placeholder.resona.dev/demo-resume.pdf",
      fileName: "demo-resume.pdf",
      extractedText:
        "Senior Frontend Engineer with 6 years of experience in React, TypeScript, and Next.js.",
    },
  });

  const jobPost = await db.jobPost.create({
    data: {
      title: "Senior Frontend Engineer",
      company: "Acme Corp",
      description:
        "We are looking for a Senior Frontend Engineer with strong React, TypeScript, and Next.js experience.",
    },
  });

  const analysis = await db.analysis.create({
    data: {
      userId: demoUser.id,
      resumeId: resume.id,
      jobPostId: jobPost.id,
      matchScore: 87,
      matchingSkills: ["React", "TypeScript", "Next.js", "REST APIs"],
      missingSkills: ["GraphQL", "Kubernetes"],
      suggestions: [
        { section: "summary", issue: "Too generic", recommendation: "Lead with your React/TS specialization" },
      ],
    },
  });

  await db.application.createMany({
    data: [
      { userId: demoUser.id, company: "Acme Corp", role: "Senior Frontend Engineer", status: "INTERVIEW", analysisId: analysis.id },
      { userId: demoUser.id, company: "Globex", role: "Frontend Lead", status: "APPLIED" },
      { userId: demoUser.id, company: "Initech", role: "Staff Engineer", status: "REJECTED" },
      { userId: demoUser.id, company: "Umbrella Inc", role: "Principal Engineer", status: "OFFER" },
    ],
  });

  console.log("Seed complete. Demo login: demo@resona.dev / demo-password-2026");
}

main().finally(() => db.$disconnect());
