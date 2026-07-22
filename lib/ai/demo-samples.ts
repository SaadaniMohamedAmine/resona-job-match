export const DEMO_SAMPLES = [
  {
    id: "frontend-strong",
    label: "Senior Frontend Engineer",
    matchHint: "strong" as const,
    resumeText: `Sarah Chen — Senior Frontend Engineer
6 years building production React/TypeScript applications. Led migration of a 40k-LOC Angular app to Next.js, cutting load time by 45%. Deep expertise in component architecture, design systems, and Tailwind CSS. Shipped accessibility-first UI used by 2M+ monthly users. Mentored 3 junior engineers. Comfortable with CI/CD, Vitest, Playwright.`,
    jobTitle: "Senior Frontend Engineer",
    company: "Northwind Labs",
    jobDescription: `We're looking for a Senior Frontend Engineer with strong React and TypeScript experience to lead our design system and component architecture. You'll work closely with product and design to ship accessible, performant interfaces. Requirements: 5+ years React, TypeScript, Tailwind CSS or similar, experience with automated testing (Vitest/Jest, Playwright/Cypress), CI/CD familiarity, mentorship experience a plus.`,
  },
  {
    id: "fullstack-partial",
    label: "Fullstack Developer",
    matchHint: "partial" as const,
    resumeText: `Amina Kader — Fullstack Developer
4 years experience across Node.js/Express backends and React frontends. Built and maintained REST APIs, basic PostgreSQL schemas, deployed on Heroku. Some exposure to Docker. Comfortable with Git workflows and agile ceremonies. Currently learning TypeScript and Next.js.`,
    jobTitle: "Fullstack Engineer",
    company: "Ridgeline Systems",
    jobDescription: `Fullstack Engineer to join our platform team. You'll work across a Next.js/TypeScript frontend and a Node.js/PostgreSQL backend, with infrastructure on AWS via Terraform. Requirements: solid Node.js and React, TypeScript proficiency, experience with PostgreSQL, familiarity with Docker and cloud infrastructure (AWS or GCP), comfort working in a fast-moving startup environment.`,
  },
] as const;

export type DemoSampleId = (typeof DEMO_SAMPLES)[number]["id"];
