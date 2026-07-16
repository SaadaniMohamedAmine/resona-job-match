export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-sm leading-relaxed text-[var(--color-muted)]">
      <h1 className="mb-6 font-[family-name:var(--font-display)] text-2xl text-[var(--color-base-light)]">
        Privacy Policy
      </h1>
      <p>
        Last updated: 2026-07-16. Résona collects your resume content and job description text
        solely to generate your match analysis. Your data is processed through third-party services
        (Groq, HuggingFace, UploadThing) solely for the purpose of providing the service. We do not
        sell or share your personal data with third parties for marketing purposes.
      </p>
      <p className="mt-4">
        You may request deletion of your account and associated data at any time by contacting us.
      </p>
    </div>
  );
}
