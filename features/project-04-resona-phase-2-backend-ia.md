# Résona — Phase 2 : Backend & IA

> Document de délégation. Spec, tasks, code complet. Dépend de la Phase 1 (schéma Prisma, auth, `lib/db.ts` déjà en place).

---

## 1. Spec

**Objectif :** tous les endpoints métier — extraction PDF, analyse GPT-4o, embeddings/similarité pgvector, réécriture, lettre de motivation, CRUD resumes/applications. À la fin de cette phase, l'app est testable via `curl`/Postman de bout en bout sans aucune UI.

**Dépendances :** Phase 1 complète (DB, auth, schéma).

**Décisions figées :**
- Modèle d'analyse et de réécriture : `gpt-4o` via l'API OpenAI, sortie forcée en JSON (`response_format: { type: "json_object" }`).
- Modèle d'embeddings : `text-embedding-3-small` (1536 dimensions, cohérent avec `vector(1536)` du schéma Prisma).
- Rate limiting : Upstash Redis + `@upstash/ratelimit` (obligatoire en serverless Vercel — un rate limiter in-memory ne survit pas entre invocations, ne pas en implémenter un).
- Validation : zod sur tous les inputs de route.

---

## 2. Tasks

- [ ] Installer `openai`, `pdf-parse`, `@upstash/ratelimit`, `@upstash/redis`
- [ ] Créer un projet Upstash Redis, ajouter les env vars
- [ ] Implémenter l'extraction de texte PDF
- [ ] Implémenter `lib/ai/analyze.ts` (appel GPT-4o + parsing structuré)
- [ ] Implémenter `lib/ai/embeddings.ts` (génération embeddings + requête pgvector)
- [ ] Endpoint `POST /api/analyze`
- [ ] Endpoint `POST /api/rewrite`
- [ ] Endpoint `POST /api/cover-letter`
- [ ] Endpoint `GET /api/resumes` + `DELETE /api/resumes/[id]`
- [ ] Endpoints `GET/POST/PATCH/DELETE /api/applications`
- [ ] Middleware de rate limiting appliqué aux routes IA
- [ ] Schémas zod pour chaque route
- [ ] Gestion d'erreurs centralisée (wrapper de route)

---

## 3. Code complet

### 3.1 Dépendances

```bash
npm install openai pdf-parse @upstash/ratelimit @upstash/redis
```

`.env.example` (ajouts à la Phase 1)

```bash
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
```

### 3.2 Extraction PDF

`lib/pdf.ts`

```ts
import pdf from "pdf-parse";

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const result = await pdf(buffer);
  return result.text.trim();
}
```

### 3.3 Rate limiting

`lib/rate-limit.ts`

```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

// Free plan: 5 analyses / day. Pro plan check happens separately in Phase 4.
export const analyzeLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 d"),
  prefix: "resona:analyze",
});

export const globalApiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  prefix: "resona:api",
});
```

### 3.4 Client OpenAI + analyse

`lib/ai/client.ts`

```ts
import OpenAI from "openai";

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
```

`lib/ai/analyze.ts`

```ts
import { openai } from "./client";
import { z } from "zod";

export const analysisResultSchema = z.object({
  matchScore: z.number().min(0).max(100),
  matchingSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  suggestions: z.array(
    z.object({
      section: z.enum(["summary", "experience", "skills"]),
      issue: z.string(),
      recommendation: z.string(),
    })
  ),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

const SYSTEM_PROMPT = `You are an expert technical recruiter and ATS specialist. Compare the given resume against the given job description. Return strict JSON matching this shape:
{
  "matchScore": number (0-100, how well the resume matches the job description),
  "matchingSkills": string[] (skills/keywords present in both),
  "missingSkills": string[] (important skills/keywords from the job description absent from the resume),
  "suggestions": [{ "section": "summary"|"experience"|"skills", "issue": string, "recommendation": string }]
}
Be precise and factual. Do not invent skills that are not in the job description.`;

export async function analyzeResume(resumeText: string, jobDescription: string): Promise<AnalysisResult> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
      },
    ],
    temperature: 0.2,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = analysisResultSchema.safeParse(JSON.parse(raw));

  if (!parsed.success) {
    throw new Error("AI response did not match expected schema: " + parsed.error.message);
  }

  return parsed.data;
}
```

`lib/ai/rewrite.ts`

```ts
import { openai } from "./client";
import { z } from "zod";

const rewriteSchema = z.object({ rewritten: z.string() });

export async function rewriteSection(
  originalText: string,
  section: "summary" | "experience" | "skills",
  jobDescription: string
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an expert resume writer. Rewrite the given "${section}" section of a resume so it better matches the target job description, while staying factually accurate to the original content — never invent experience, titles, or skills that are not implied by the original text. Return strict JSON: { "rewritten": string }.`,
      },
      {
        role: "user",
        content: `ORIGINAL ${section.toUpperCase()}:\n${originalText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
      },
    ],
    temperature: 0.4,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = rewriteSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) throw new Error("AI rewrite response malformed");
  return parsed.data.rewritten;
}
```

`lib/ai/cover-letter.ts`

```ts
import { openai } from "./client";

export async function generateCoverLetter(
  resumeText: string,
  jobDescription: string,
  companyName?: string
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert career coach writing cover letters. Tone: reassuring expert — precise, confident, factual, never generic or exclamatory. Write a complete, ready-to-send cover letter (3-4 paragraphs) based on the resume and job description provided. Do not use placeholders like "[Company Name]" if the company name is given.`,
      },
      {
        role: "user",
        content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}\n\nCOMPANY:\n${companyName ?? "Not specified"}`,
      },
    ],
    temperature: 0.5,
  });

  return completion.choices[0]?.message?.content ?? "";
}
```

### 3.5 Embeddings & similarité pgvector

`lib/ai/embeddings.ts`

```ts
import { openai } from "./client";
import { db } from "@/lib/db";

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000), // guard against token limits
  });
  return response.data[0].embedding;
}

export async function saveResumeEmbedding(resumeId: string, embedding: number[]) {
  const vectorLiteral = `[${embedding.join(",")}]`;
  await db.$executeRawUnsafe(
    `UPDATE "Resume" SET embedding = $1::vector WHERE id = $2`,
    vectorLiteral,
    resumeId
  );
}

export async function saveJobPostEmbedding(jobPostId: string, embedding: number[]) {
  const vectorLiteral = `[${embedding.join(",")}]`;
  await db.$executeRawUnsafe(
    `UPDATE "JobPost" SET embedding = $1::vector WHERE id = $2`,
    vectorLiteral,
    jobPostId
  );
}

export async function cosineSimilarity(resumeId: string, jobPostId: string): Promise<number> {
  const result = await db.$queryRawUnsafe<{ similarity: number }[]>(
    `SELECT 1 - (r.embedding <=> j.embedding) AS similarity
     FROM "Resume" r, "JobPost" j
     WHERE r.id = $1 AND j.id = $2`,
    resumeId,
    jobPostId
  );
  return result[0]?.similarity ?? 0;
}
```

### 3.6 Wrapper d'erreurs commun

`lib/api-handler.ts`

```ts
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export function withErrorHandling(handler: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      Sentry.captureException(error);
      console.error(error);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }
  };
}
```

### 3.7 Endpoint `/api/analyze`

`app/api/analyze/route.ts`

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { extractTextFromPdf } from "@/lib/pdf";
import { analyzeResume } from "@/lib/ai/analyze";
import { generateEmbedding, saveResumeEmbedding, saveJobPostEmbedding } from "@/lib/ai/embeddings";
import { analyzeLimiter } from "@/lib/rate-limit";
import { withErrorHandling } from "@/lib/api-handler";

const bodySchema = z.object({
  fileUrl: z.string().url(),
  fileName: z.string(),
  jobTitle: z.string().min(1),
  company: z.string().optional(),
  jobDescription: z.string().min(50, "Job description is too short"),
});

export const POST = withErrorHandling(async (req: Request) => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success } = await analyzeLimiter.limit(session.user.id);
  if (!success) {
    return NextResponse.json(
      { error: "You've reached your analysis limit for today." },
      { status: 429 }
    );
  }

  const json = await req.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { fileUrl, fileName, jobTitle, company, jobDescription } = parsed.data;

  const pdfBuffer = Buffer.from(await (await fetch(fileUrl)).arrayBuffer());
  const extractedText = await extractTextFromPdf(pdfBuffer);

  const resume = await db.resume.create({
    data: { userId: session.user.id, fileUrl, fileName, extractedText },
  });

  const jobPost = await db.jobPost.create({
    data: { title: jobTitle, company, description: jobDescription },
  });

  const [resumeEmbedding, jobEmbedding] = await Promise.all([
    generateEmbedding(extractedText),
    generateEmbedding(jobDescription),
  ]);
  await Promise.all([
    saveResumeEmbedding(resume.id, resumeEmbedding),
    saveJobPostEmbedding(jobPost.id, jobEmbedding),
  ]);

  const result = await analyzeResume(extractedText, jobDescription);

  const analysis = await db.analysis.create({
    data: {
      userId: session.user.id,
      resumeId: resume.id,
      jobPostId: jobPost.id,
      matchScore: result.matchScore,
      matchingSkills: result.matchingSkills,
      missingSkills: result.missingSkills,
      suggestions: result.suggestions,
    },
  });

  return NextResponse.json({ analysisId: analysis.id, ...result });
});
```

### 3.8 Endpoint `/api/rewrite`

`app/api/rewrite/route.ts`

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rewriteSection } from "@/lib/ai/rewrite";
import { withErrorHandling } from "@/lib/api-handler";

const bodySchema = z.object({
  analysisId: z.string(),
  section: z.enum(["summary", "experience", "skills"]),
  originalText: z.string().min(1),
});

export const POST = withErrorHandling(async (req: Request) => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const analysis = await db.analysis.findUnique({
    where: { id: parsed.data.analysisId },
    include: { jobPost: true },
  });
  if (!analysis || analysis.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rewritten = await rewriteSection(
    parsed.data.originalText,
    parsed.data.section,
    analysis.jobPost.description
  );

  return NextResponse.json({ rewritten });
});
```

### 3.9 Endpoint `/api/cover-letter`

`app/api/cover-letter/route.ts`

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateCoverLetter } from "@/lib/ai/cover-letter";
import { withErrorHandling } from "@/lib/api-handler";

const bodySchema = z.object({ analysisId: z.string() });

export const POST = withErrorHandling(async (req: Request) => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const analysis = await db.analysis.findUnique({
    where: { id: parsed.data.analysisId },
    include: { resume: true, jobPost: true },
  });
  if (!analysis || analysis.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const coverLetter = await generateCoverLetter(
    analysis.resume.extractedText,
    analysis.jobPost.description,
    analysis.jobPost.company ?? undefined
  );

  await db.analysis.update({ where: { id: analysis.id }, data: { coverLetter } });

  return NextResponse.json({ coverLetter });
});
```

### 3.10 Endpoint `/api/resumes`

`app/api/resumes/route.ts`

```ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";

export const GET = withErrorHandling(async () => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const analyses = await db.analysis.findMany({
    where: { userId: session.user.id },
    include: { resume: true, jobPost: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ analyses });
});
```

`app/api/resumes/[id]/route.ts`

```ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";

export const DELETE = withErrorHandling(async (req: Request, { params }: { params: { id: string } }) => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resume = await db.resume.findUnique({ where: { id: params.id } });
  if (!resume || resume.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.resume.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
});
```

### 3.11 Endpoints `/api/applications`

`app/api/applications/route.ts`

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";

const createSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  analysisId: z.string().optional(),
});

export const GET = withErrorHandling(async () => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const applications = await db.application.findMany({
    where: { userId: session.user.id },
    include: { analysis: true },
    orderBy: { appliedAt: "desc" },
  });
  return NextResponse.json({ applications });
});

export const POST = withErrorHandling(async (req: Request) => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const application = await db.application.create({
    data: { userId: session.user.id, ...parsed.data },
  });
  return NextResponse.json({ application });
});
```

`app/api/applications/[id]/route.ts`

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { withErrorHandling } from "@/lib/api-handler";

const updateSchema = z.object({
  status: z.enum(["APPLIED", "INTERVIEW", "OFFER", "REJECTED"]),
});

export const PATCH = withErrorHandling(async (req: Request, { params }: { params: { id: string } }) => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const application = await db.application.findUnique({ where: { id: params.id } });
  if (!application || application.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await db.application.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
  });
  return NextResponse.json({ application: updated });
});

export const DELETE = withErrorHandling(async (req: Request, { params }: { params: { id: string } }) => {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const application = await db.application.findUnique({ where: { id: params.id } });
  if (!application || application.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.application.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
});
```

---

**Definition of Done — Phase 2 :** chaque endpoint testable au `curl`/Postman retourne les données attendues, le rate limit se déclenche après 5 analyses/jour en local (ou ajuster la fenêtre pour tester plus vite), les erreurs remontent dans Sentry, `matchScore`/`matchingSkills`/`missingSkills` sont cohérents en base après un appel `/api/analyze`.
