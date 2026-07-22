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
  {
    id: "backend-strong",
    label: "Backend Engineer",
    matchHint: "strong" as const,
    resumeText: `Daniel Okoro — Backend Engineer
7 years designing and operating distributed systems in Go and Node.js. Built event-driven microservices handling 50k requests/sec, with Kafka and Redis. Deep knowledge of PostgreSQL performance tuning and schema design. Owns on-call rotation for payments infrastructure. Experienced with gRPC, Docker, Kubernetes, and Terraform.`,
    jobTitle: "Senior Backend Engineer",
    company: "Meridian Payments",
    jobDescription: `Senior Backend Engineer for our payments platform team. You'll design and scale microservices handling high-throughput transaction processing. Requirements: 5+ years backend experience (Go, Node.js, or similar), strong PostgreSQL skills, experience with message queues (Kafka, RabbitMQ), Kubernetes and infrastructure-as-code, on-call experience for critical systems.`,
  },
  {
    id: "product-manager-partial",
    label: "Product Manager",
    matchHint: "partial" as const,
    resumeText: `Julia Marchetti — Product Manager
3 years managing B2C mobile app roadmaps. Ran user research, wrote PRDs, and coordinated with design/engineering through weekly sprints. Familiar with Amplitude and basic SQL for metrics. Led one A/B testing initiative that improved onboarding conversion by 12%. New to enterprise/B2B product cycles.`,
    jobTitle: "Senior Product Manager",
    company: "Vantage Cloud",
    jobDescription: `Senior Product Manager for our enterprise B2B SaaS platform. You'll own the roadmap for our data integrations suite, working with enterprise customers and a distributed engineering team. Requirements: 5+ years B2B/enterprise product management, strong SQL and analytics skills, experience running discovery with enterprise stakeholders, track record shipping complex platform features.`,
  },
  {
    id: "data-analyst-weak",
    label: "Marketing Data Analyst",
    matchHint: "weak" as const,
    resumeText: `Priya Nair — Marketing Data Analyst
2 years building campaign performance dashboards in Excel and Google Analytics. Basic SQL for pulling marketing metrics. Comfortable presenting insights to non-technical stakeholders. No experience with Python, machine learning, or production data pipelines.`,
    jobTitle: "Senior Data Scientist",
    company: "Orbital Analytics",
    jobDescription: `Senior Data Scientist to build and deploy machine learning models for demand forecasting. Requirements: 5+ years in data science, strong Python (pandas, scikit-learn, PyTorch), experience deploying models to production, deep statistics background, experience with distributed data processing (Spark or similar), PhD or MS in a quantitative field preferred.`,
  },
  {
    id: "devops-strong",
    label: "DevOps / SRE Engineer",
    matchHint: "strong" as const,
    resumeText: `Marcus Webb — DevOps / Site Reliability Engineer
6 years running production infrastructure on AWS and GCP. Built CI/CD pipelines with GitHub Actions and ArgoCD across 40+ microservices. Deep Kubernetes and Terraform expertise. Reduced infrastructure costs by 30% through right-sizing and spot instance strategy. On-call lead, owns incident response and postmortems.`,
    jobTitle: "Senior SRE",
    company: "Cascade Cloud",
    jobDescription: `Senior Site Reliability Engineer to own our Kubernetes platform and CI/CD tooling. Requirements: 5+ years SRE/DevOps experience, deep Kubernetes and Terraform expertise, experience with GitOps workflows (ArgoCD or Flux), strong incident response and on-call experience, cost optimization experience on AWS or GCP.`,
  },
  {
    id: "ux-designer-partial",
    label: "UX Designer",
    matchHint: "partial" as const,
    resumeText: `Lena Fischer — UX Designer
3 years designing consumer mobile app flows in Figma. Ran usability testing sessions and basic user interviews. Comfortable with design systems and handoff to engineering. Limited experience with enterprise/dashboard-heavy interfaces or accessibility auditing.`,
    jobTitle: "Senior Product Designer",
    company: "Ledgerly",
    jobDescription: `Senior Product Designer for our enterprise financial dashboard product. You'll own complex data-dense interfaces used by finance teams. Requirements: 5+ years product design, strong experience with dashboard/data visualization design, accessibility auditing (WCAG) experience, comfort working directly with enterprise customers on research.`,
  },
  {
    id: "mobile-strong",
    label: "Mobile Engineer",
    matchHint: "strong" as const,
    resumeText: `Tomás Rivera — Mobile Engineer
5 years building native iOS apps in Swift, with recent React Native cross-platform work. Shipped a fitness app to 500k+ downloads, owning App Store release process end-to-end. Strong on performance profiling, offline-first architecture, and push notification systems. Familiar with Fastlane and CI for mobile.`,
    jobTitle: "Senior Mobile Engineer",
    company: "Trailhead Fitness",
    jobDescription: `Senior Mobile Engineer to lead our iOS and React Native codebase. Requirements: 5+ years mobile development (Swift and/or React Native), experience with offline-first data sync, App Store release management, mobile CI/CD (Fastlane or similar), performance profiling experience on large consumer apps.`,
  },
  {
    id: "qa-partial",
    label: "QA Engineer",
    matchHint: "partial" as const,
    resumeText: `Hana Kobayashi — QA Engineer
3 years manual and semi-automated testing for web applications. Wrote test plans and basic Selenium scripts. Some exposure to Cypress. Limited experience building full automation frameworks from scratch or working within a CI/CD pipeline.`,
    jobTitle: "Senior SDET",
    company: "Fieldstone Health",
    jobDescription: `Senior SDET to build and own our end-to-end test automation framework. Requirements: 5+ years test automation experience, strong Cypress or Playwright expertise, experience designing test frameworks from scratch, deep CI/CD integration experience, comfort working in a regulated (healthcare) environment.`,
  },
  {
    id: "growth-marketer-weak",
    label: "Growth Marketer",
    matchHint: "weak" as const,
    resumeText: `Chris Bennett — Growth Marketer
4 years running paid acquisition campaigns and email lifecycle marketing for e-commerce brands. Strong in Klaviyo, Google Ads, and copywriting. No coding background, no experience with technical product analytics tooling or SQL.`,
    jobTitle: "Growth Engineer",
    company: "Pulse Analytics",
    jobDescription: `Growth Engineer to build and run experimentation infrastructure across our product. Requirements: strong SQL and Python, experience instrumenting analytics events, A/B testing platform experience (LaunchDarkly, Optimizely, or similar), comfort reading and writing application code alongside engineers.`,
  },
] as const;

export type DemoSampleId = (typeof DEMO_SAMPLES)[number]["id"];
