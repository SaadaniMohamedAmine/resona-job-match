"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { GoogleIcon, LinkedInIcon } from "@/components/ui/brand-icons";
import { Stepper } from "@/components/ui/stepper";
import { notify } from "@/lib/toast";

const SEARCH_STAGES = ["starting", "applying", "interviewing"] as const;

export default function SignUpPage() {
  const t = useTranslations("auth");
  const tNotify = useTranslations("notifications");
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  const [searchStage, setSearchStage] = useState<(typeof SEARCH_STAGES)[number]>("starting");
  const [saving, setSaving] = useState(false);

  const STAGE_LABELS: Record<(typeof SEARCH_STAGES)[number], string> = {
    starting: t("stageStarting"),
    applying: t("stageApplying"),
    interviewing: t("stageInterviewing"),
  };

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      notify.error(res.status === 409 ? tNotify("emailInUse") : tNotify("generic"));
      return;
    }
    notify.success(tNotify("accountCreated"));
    await signIn("credentials", { email, password, redirect: false });
    setStep(1);
  }

  async function handleFinishOnboarding() {
    setSaving(true);
    if (targetRole.trim()) {
      await fetch("/api/user/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: targetRole.trim(), searchStage }),
      });
    }
    router.push("/upload");
  }

  function handleSkip() {
    router.push("/upload");
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-6">
      <div className="w-full max-w-110">
        <div className="overflow-hidden rounded-(--radius-control) border border-track bg-track/20">
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <Stepper steps={[t("identityStep"), t("experienceStep")]} currentStep={step} />
            </div>

            {step === 0 && (
              <>
                <h2 className="mb-6 font-display text-xl font-medium text-base-light">
                  {t("signUpTitle")}
                </h2>

                <div className="mb-6 flex flex-col gap-3">
                  <button
                    onClick={() => signIn("google", { callbackUrl: "/upload" })}
                    className="flex items-center justify-center gap-3 rounded-(--radius-control) border border-track py-2.5 text-sm text-base-light transition-all hover:bg-track active:scale-[0.98]"
                  >
                    <GoogleIcon />
                    {t("continueWithGoogle")}
                  </button>
                  <button
                    onClick={() => alert(t("comingSoon"))}
                    className="flex items-center justify-center gap-3 rounded-(--radius-control) border border-track py-2.5 text-sm text-muted opacity-60 transition-all hover:bg-track active:scale-[0.98]"
                  >
                    <LinkedInIcon />
                    {t("continueWithLinkedIn")}
                  </button>
                </div>

                <div className="mb-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-track" />
                  <span className="text-xs tracking-widest text-muted uppercase">{t("orUseEmail")}</span>
                  <div className="h-px flex-1 bg-track" />
                </div>

                <form onSubmit={handleCreateAccount} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-xs tracking-widest text-muted uppercase">
                      {t("emailLabel")}
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-(--radius-control) border border-track bg-transparent px-4 py-3 text-sm text-base-light placeholder:text-muted focus:border-accent focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="password" className="text-xs tracking-widest text-muted uppercase">
                      {t("passwordLabel")}
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t("passwordPlaceholder")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-(--radius-control) border border-track bg-transparent px-4 py-3 pr-11 text-sm text-base-light placeholder:text-muted focus:border-accent focus:outline-none"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted transition-colors hover:text-base-light"
                      >
                        {showPassword ? (
                          <IconEyeOff size={20} stroke={1.5} />
                        ) : (
                          <IconEye size={20} stroke={1.5} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-4 rounded-(--radius-control) bg-accent py-3.5 text-sm font-bold text-[var(--color-base)] transition-all hover:opacity-90 active:scale-[0.98]"
                  >
                    {t("createAccount")}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-muted">
                  {t.rich("termsNotice", {
                    terms: (chunks) => (
                      <Link href="/terms" className="text-accent hover:underline">
                        {chunks}
                      </Link>
                    ),
                    privacy: (chunks) => (
                      <Link href="/privacy" className="text-accent hover:underline">
                        {chunks}
                      </Link>
                    ),
                  })}
                </p>
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="mb-2 font-display text-xl font-medium text-base-light">
                  {t("onboardingTitle")}
                </h2>
                <p className="mb-6 text-sm text-muted">{t("onboardingSubtitle")}</p>

                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="targetRole" className="text-xs tracking-widest text-muted uppercase">
                      {t("targetRoleLabel")}
                    </label>
                    <input
                      id="targetRole"
                      placeholder={t("targetRolePlaceholder")}
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="rounded-(--radius-control) border border-track bg-transparent px-4 py-3 text-sm text-base-light placeholder:text-muted focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs tracking-widest text-muted uppercase">
                      {t("searchStageLabel")}
                    </label>
                    <div className="flex flex-col gap-2">
                      {SEARCH_STAGES.map((stage) => (
                        <button
                          key={stage}
                          type="button"
                          onClick={() => setSearchStage(stage)}
                          className={`rounded-(--radius-control) border px-4 py-2.5 text-left text-sm transition-colors ${
                            searchStage === stage
                              ? "border-accent text-accent"
                              : "border-track text-muted hover:border-accent/40"
                          }`}
                        >
                          {STAGE_LABELS[stage]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleFinishOnboarding}
                    disabled={saving}
                    className="mt-2 rounded-(--radius-control) bg-accent py-3.5 text-sm font-bold text-[var(--color-base)] transition-all hover:opacity-90 disabled:opacity-60"
                  >
                    {t("continueCta")}
                  </button>
                  <button
                    onClick={handleSkip}
                    className="text-center text-sm text-muted transition-colors hover:text-accent"
                  >
                    {t("skipForNow")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {step === 0 && (
          <p className="mt-6 text-center text-sm text-muted">
            {t("alreadyHaveAccount")}{" "}
            <Link href="/login" className="font-bold text-accent hover:underline">
              {t("logIn")}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
