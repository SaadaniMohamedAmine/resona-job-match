const SECTIONS = [
  {
    title: "Information we collect",
    body: (
      <>
        <p>When you create an account, we collect your name, email address, and profile picture
          (via Google OAuth) or your email and a hashed password (via email sign-up).</p>
        <p className="mt-3">
          When you use the analysis features, we store the resume files you upload, the text
          extracted from them, and the job description text you submit for comparison.
        </p>
        <p className="mt-3">
          If you subscribe to Pro, Stripe processes your payment details directly — we only store
          your Stripe customer ID and subscription status, never your card details.
        </p>
      </>
    ),
  },
  {
    title: "How we use your information",
    body: (
      <p>
        Your resume and job description text are used to generate match scores, gap analysis,
        section rewrites, and cover letters. Your applications (company, role, status) are stored
        so you can track them on your dashboard. We do not use your resume content for any purpose
        other than providing these features to you.
      </p>
    ),
  },
  {
    title: "Third-party services",
    body: (
      <>
        <p>Résona relies on the following third-party services to operate:</p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>
            <span className="text-base-light">Groq</span> — generates match analysis, section
            rewrites, and cover letters from your resume and job description text.
          </li>
          <li>
            <span className="text-base-light">HuggingFace</span> — computes text embeddings used
            to calculate your match score.
          </li>
          <li>
            <span className="text-base-light">UploadThing</span> — stores your uploaded resume
            files.
          </li>
          <li>
            <span className="text-base-light">Neon</span> — hosts our PostgreSQL database.
          </li>
          <li>
            <span className="text-base-light">Stripe</span> — processes Pro plan payments.
          </li>
          <li>
            <span className="text-base-light">Sentry</span> — error monitoring; only technical
            error data, never resume content.
          </li>
        </ul>
        <p className="mt-3">
          We do not sell or share your personal data with third parties for marketing purposes.
        </p>
      </>
    ),
  },
  {
    title: "Data retention & deletion",
    body: (
      <p>
        You can delete individual resumes and analyses at any time from your resume history. You
        may request full account deletion, which removes your account and all associated resumes,
        analyses, and applications, by contacting us.
      </p>
    ),
  },
  {
    title: "Your rights",
    body: (
      <p>
        You can access, export, or delete your data at any time. Since Résona is a portfolio
        project rather than a production service handling large-scale personal data, requests are
        handled directly and promptly — reach out and we&apos;ll take care of it.
      </p>
    ),
  },
  {
    title: "Security",
    body: (
      <p>
        Passwords are hashed with bcrypt and never stored in plain text. All traffic is encrypted
        in transit (TLS). Authentication is handled by NextAuth, including Google OAuth sign-in.
      </p>
    ),
  },
  {
    title: "Changes to this policy",
    body: (
      <p>
        We may update this policy as the product evolves. Material changes will be reflected here
        with an updated date.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16 md:px-16">
      <h1 className="font-display text-2xl font-bold text-base-light">Privacy Policy</h1>
      <p className="mt-2 text-xs tracking-widest text-muted uppercase">Last updated: 2026-07-20</p>

      <p className="mt-8 text-sm leading-relaxed text-muted">
        Résona is a portfolio project. This policy explains what data we collect, why, and how you
        can control it — written plainly rather than in dense legal language.
      </p>

      {SECTIONS.map((section) => (
        <section key={section.title} className="mt-10">
          <h2 className="mb-3 font-display text-lg font-medium text-base-light">{section.title}</h2>
          <div className="text-sm leading-relaxed text-muted">{section.body}</div>
        </section>
      ))}

      <p className="mt-10 text-sm text-muted">
        Questions about your data?{" "}
        <a href="mailto:hello@resona.dev" className="text-accent hover:underline">
          hello@resona.dev
        </a>
      </p>
    </div>
  );
}
