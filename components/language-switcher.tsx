"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales } from "@/i18n/request";

export function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      value={currentLocale}
      onChange={(e) => {
        const newPath = pathname.replace(`/${currentLocale}`, `/${e.target.value}`);
        router.push(newPath);
      }}
      className="bg-transparent text-xs text-[var(--color-muted)]"
    >
      {locales.map((l) => (
        <option key={l} value={l}>
          {l.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
