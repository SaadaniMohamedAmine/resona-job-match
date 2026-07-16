# Résona — Product Requirements Document (PRD)

| | |
|---|---|
| **Product** | Résona |
| **Tagline** | Your resume, aligned to every opportunity. |
| **Status** | In development |
| **Owner** | Mohamed Amine Saadani |
| **Last updated** | 2026-07-16 |

---

## 1. Overview

Résona is an AI-powered resume and job-match analysis platform. A user uploads their resume (PDF) and pastes a job description; Résona returns a semantic match score, identifies the gap between the candidate's profile and the role, rewrites resume sections to close that gap, and generates a tailored cover letter. A built-in application tracker lets the user manage every application they send from a single kanban board.

Unlike most resume tools, which score resumes by keyword density, Résona uses OpenAI embeddings and cosine similarity to compare resume and job description *semantically* — the same underlying experience, phrased differently, should score consistently against a role it's actually a good fit for.

## 2. Problem Statement

Over 250 million resumes are submitted annually in the US alone, and an estimated 75% are rejected by Applicant Tracking Systems (ATS) before a human recruiter ever reads them. Job seekers have no reliable way to know, before applying, how well their resume actually matches a specific role — and generic "resume score" tools optimize for keyword stuffing rather than genuine fit.

## 3. Goals

- Give a candidate an accurate, explainable match score between their resume and a specific job description.
- Show exactly which skills are missing, not just a vague score.
- Let the candidate close that gap directly in-product (AI rewriting), rather than sending them elsewhere to fix it.
- Reduce the operational overhead of a job search by tracking every application in one place.
- Present all of the above through a premium, restrained visual identity — the product itself is a portfolio piece and must read as production-grade, not a template.

## 4. Non-Goals (v1)

- Résona does not submit applications on the user's behalf (no auto-apply).
- Résona does not source or scrape job listings — the user pastes the job description manually.
- Résona does not include a dedicated recruiter-facing product (posting jobs, searching candidates) — recruiters are a secondary beneficiary (they receive stronger-matched applications), not a functional user type with their own permissions.
- No native mobile app — responsive web only.
- No admin dashboard/back-office in v1.

## 5. User Types

| User type | Description | Access |
|---|---|---|
| **Visitor** | Unauthenticated | Landing page, pricing, sign-up/login only |
| **Free user** | Registered, no active subscription | 3 analyses / 30 days, match score + gap detection, up to 5 saved analyses, application tracker, dashboard. No AI rewriting or cover letter generation. |
| **Pro user** | Registered, active Stripe subscription | Unlimited analyses, AI section rewriting, cover letter generation, unlimited history, PDF export |

## 6. Core Features

### 6.1 Authentication & Account
Email/password and OAuth (Google, LinkedIn) via NextAuth. No email verification step (friction reduction, consistent with other portfolio projects' auth patterns).

### 6.2 Resume Upload & Job Description Input
Drag-and-drop PDF upload (via UploadThing) with inline preview, plus a textarea for pasting the job description and title/company fields.

### 6.3 AI Match Analysis
GPT-4o compares the extracted resume text against the job description and returns: a 0-100 match score, a list of matching skills, a list of missing skills, and structured improvement suggestions per resume section.

### 6.4 Semantic Similarity (Embeddings)
Resume and job description are independently embedded (`text-embedding-3-small`) and compared via cosine similarity in pgvector, complementing the GPT-4o structured score with a second, independent semantic signal.

### 6.5 AI Resume Rewriting
Per-section (summary, experience, skills) rewriting, shown as a before/after comparison. Rewrites must stay factually grounded in the original content — never invent experience or skills not implied by the source text.

### 6.6 AI Cover Letter Generation
A complete, ready-to-send cover letter generated from the resume, job description, and company name, editable in place, with copy-to-clipboard and PDF export.

### 6.7 Resume / Analysis History
A list of every past analysis with score, job title, and date, with quick access back into results.

### 6.8 Application Tracker
A kanban board with four fixed columns — Applied, Interview, Offer, Rejected — optionally linked back to the originating analysis.

### 6.9 Dashboard
Aggregate stats: applications sent, response rate, average match score.

### 6.10 Billing
Free and Pro plans via Stripe Checkout, self-service plan management via the Stripe customer portal, usage quotas enforced server-side.

### 6.11 Internationalization
Full UI available in English and French.

### 6.12 Account Settings
Profile fields, password change, sign-out, plan/billing status.

## 7. Acceptance Criteria

| Feature | Acceptance criteria |
|---|---|
| Upload & analyze | Given a valid PDF and a job description of at least 50 characters, when the user submits, then a match score, matching skills, and missing skills are displayed within 30 seconds. |
| Rate limiting | Given a Free user who has run 3 analyses in the last 30 days, when they attempt a 4th, then the request is rejected with a clear, non-technical error message (not a silent failure). |
| Rewrite | Given an existing analysis, when the user requests a rewrite of a specific section, then the rewritten text is grounded in the original content and does not introduce unverifiable claims. |
| Cover letter | Given an existing analysis, when the user requests a cover letter, then a complete, non-placeholder letter is generated and both "copy" and "export PDF" work. |
| Tracker | Given at least one tracked application, when the user changes its status, then the card moves to the correct column and the change persists on reload. |
| Billing | Given a Free user who completes Stripe Checkout with a test card, when the webhook fires, then their plan flips to Pro without requiring a page refresh or manual action. |
| i18n | Given any page in the product, when the user switches locale, then all visible UI text (not just navigation) renders in the selected language. |
| Empty states | Given a new user with zero analyses or zero tracked applications, when they visit the relevant page, then a clear empty state with a call-to-action is shown instead of a blank screen. |

## 8. Success Metrics (portfolio context)

Since Résona is a portfolio piece rather than a live commercial product, success is measured by:
- Functional completeness against this PRD (all acceptance criteria pass)
- Lighthouse score ≥ 90 across performance/accessibility/SEO
- Test coverage on core business logic (`lib/ai/`, rate limiting, quota logic)
- Visual and interaction quality sufficient to be presented as a flagship case study in the author's portfolio

## 9. Assumptions & Constraints

- OpenAI API costs are a direct function of usage — Free plan quotas exist primarily to bound this cost, not as a monetization strategy in itself.
- pgvector similarity is a secondary/complementary signal to the GPT-4o structured score, not the sole scoring mechanism.
- Legal content (Privacy Policy, Terms of Service) shipped in v1 is structurally complete but not a substitute for real legal review before any public commercial launch.
