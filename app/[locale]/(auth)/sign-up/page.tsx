"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-(--radius-card) border border-track p-8">
        {message && <p className="mb-4 text-center text-sm text-accent">{message}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-(--radius-control) border border-track bg-transparent px-4 py-2.5 text-sm text-base-light placeholder:text-muted"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-(--radius-control) border border-track bg-transparent px-4 py-2.5 text-sm text-base-light placeholder:text-muted"
            required
            minLength={8}
          />
          <button
            type="submit"
            className="rounded-(--radius-control) bg-accent py-2.5 text-sm font-medium text-[var(--color-base)] transition-opacity hover:opacity-90"
          >
            Create account
          </button>
        </form>
        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={() => signIn("google", { callbackUrl: "/upload" })}
            className="rounded-(--radius-control) border border-track py-2.5 text-sm text-base-light transition-opacity hover:opacity-90"
          >
            Continue with Google
          </button>
          <button
            onClick={() => alert("Fonctionnalité disponible dans les prochains mois")}
            className="cursor-not-allowed rounded-(--radius-control) border border-track py-2.5 text-sm text-muted opacity-60"
          >
            Continue with LinkedIn
          </button>
        </div>
        <p className="mt-6 text-center text-xs text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-accent">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
