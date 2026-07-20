"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { GoogleIcon, LinkedInIcon } from "@/components/ui/brand-icons";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      setMessage(typeof data.error === "string" ? data.error : "Something went wrong");
      return;
    }
    await signIn("credentials", { email, password, callbackUrl: "/upload" });
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-6">
      <div className="w-full max-w-110">
        <div className="overflow-hidden rounded-(--radius-control) border border-track bg-track/20">
          <div className="p-6 md:p-8">
            {/* Decorative step indicator */}
            <div className="mb-6">
              <div className="relative h-px w-full bg-track">
                <div className="absolute top-0 left-0 h-0.75 w-1/2 -translate-y-px bg-accent" />
              </div>
              <div className="mt-3 flex justify-between text-xs uppercase">
                <span className="text-accent">Identity</span>
                <span className="text-muted">Experience</span>
              </div>
            </div>

            <h2 className="mb-6 font-display text-xl font-medium text-base-light">
              Create your profile
            </h2>

            {message && <p className="mb-4 text-center text-sm text-accent">{message}</p>}

            <div className="mb-6 flex flex-col gap-3">
              <button
                onClick={() => signIn("google", { callbackUrl: "/upload" })}
                className="flex items-center justify-center gap-3 rounded-(--radius-control) border border-track py-2.5 text-sm text-base-light transition-all hover:bg-track active:scale-[0.98]"
              >
                <GoogleIcon />
                Continue with Google
              </button>
              <button
                onClick={() => alert("Fonctionnalité disponible dans les prochains mois")}
                className="flex items-center justify-center gap-3 rounded-(--radius-control) border border-track py-2.5 text-sm text-muted opacity-60 transition-all hover:bg-track active:scale-[0.98]"
              >
                <LinkedInIcon />
                Continue with LinkedIn
              </button>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-track" />
              <span className="text-xs tracking-widest text-muted uppercase">or use email</span>
              <div className="h-px flex-1 bg-track" />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-xs tracking-widest text-muted uppercase">
                  Email address
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
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-(--radius-control) border border-track bg-transparent px-4 py-3 pr-11 text-sm text-base-light placeholder:text-muted focus:border-accent focus:outline-none"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
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
                Create Account
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-accent hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-accent hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-accent hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
