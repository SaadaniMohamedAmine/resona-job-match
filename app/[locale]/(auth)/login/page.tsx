"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { IconBrandGoogle, IconBrandLinkedin } from "@tabler/icons-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      setMessage("Invalid email or password");
    } else {
      window.location.href = "/upload";
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-[440px]">
        <div className="overflow-hidden rounded-(--radius-control) border border-track bg-track/20">
          {/* Decorative step indicator */}
          <div className="flex h-1 w-full items-end">
            <div className="h-[3px] w-1/3 bg-accent" />
            <div className="h-px w-2/3 bg-muted opacity-30" />
          </div>

          <div className="p-8 md:p-10">
            <h2 className="mb-8 font-display text-xl font-medium text-base-light">Welcome back</h2>

            {message && <p className="mb-4 text-center text-sm text-accent">{message}</p>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs tracking-widest text-muted uppercase">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert("Fonctionnalité disponible dans les prochains mois")}
                    className="text-xs text-accent transition-opacity hover:opacity-80"
                  >
                    Forgot?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
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
                Sign In
              </button>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-track" />
              </div>
              <div className="relative flex justify-center bg-track/20 px-4 text-xs tracking-widest text-muted uppercase">
                Or continue with
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => signIn("google", { callbackUrl: "/upload" })}
                className="flex items-center justify-center gap-3 rounded-(--radius-control) border border-track py-3 text-sm text-base-light transition-all hover:bg-track active:scale-[0.98]"
              >
                <IconBrandGoogle size={18} stroke={1.5} />
                Continue with Google
              </button>
              <button
                onClick={() => alert("Fonctionnalité disponible dans les prochains mois")}
                className="flex items-center justify-center gap-3 rounded-(--radius-control) border border-track py-3 text-sm text-muted opacity-60 transition-all hover:bg-track active:scale-[0.98]"
              >
                <IconBrandLinkedin size={18} stroke={1.5} />
                Continue with LinkedIn
              </button>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-medium text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
