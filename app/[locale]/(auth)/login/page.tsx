"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { GoogleIcon, LinkedInIcon } from "@/components/ui/brand-icons";
import { notify } from "@/lib/toast";

export default function LoginPage() {
  const t = useTranslations("auth");
  const tNotify = useTranslations("notifications");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      notify.error(tNotify("invalidCredentials"));
    } else {
      window.location.href = "/upload";
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-6">
      <div className="w-full max-w-110">
        <div className="overflow-hidden rounded-(--radius-control) border border-track bg-track/20">
          {/* Decorative step indicator */}
          <div className="flex h-1 w-full items-end">
            <div className="h-0.75 w-1/3 bg-accent" />
            <div className="h-px w-2/3 bg-muted opacity-30" />
          </div>

          <div className="p-6 md:p-8">
            <h2 className="mb-6 font-display text-xl font-medium text-base-light">{t("loginTitle")}</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs tracking-widest text-muted uppercase">
                    {t("passwordLabel")}
                  </label>
                  <button
                    type="button"
                    onClick={() => alert(t("comingSoon"))}
                    className="text-xs text-accent transition-opacity hover:opacity-80"
                  >
                    {t("forgotPassword")}
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder={t("passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-(--radius-control) border border-track bg-transparent px-4 py-3 text-sm text-base-light placeholder:text-muted focus:border-accent focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="mt-4 rounded-(--radius-control) bg-accent py-3.5 text-sm font-medium text-[var(--color-base)] transition-all hover:opacity-90 active:scale-[0.98]"
              >
                {t("signInCta")}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-track" />
              </div>
              <div className="relative flex justify-center bg-track/20 px-4 text-xs tracking-widest text-muted uppercase">
                {t("orContinueWith")}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
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
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          {t("noAccount")}{" "}
          <Link href="/sign-up" className="font-medium text-accent hover:underline">
            {t("signUpCta")}
          </Link>
        </p>
      </div>
    </div>
  );
}
