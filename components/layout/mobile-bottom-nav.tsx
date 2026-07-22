import Link from "next/link";
import { useTranslations } from "next-intl";
import { IconUpload, IconChartBar, IconClipboardCheck } from "@tabler/icons-react";

const ITEMS = [
  { key: "stepUpload", href: "/upload", icon: IconUpload },
  { key: "stepAnalyze", href: "/analyzing", icon: IconChartBar },
  { key: "stepResults", href: "/resumes", icon: IconClipboardCheck },
] as const;

export function MobileBottomNav() {
  const t = useTranslations("upload");

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-track bg-[var(--color-track)] py-3 md:hidden">
      {ITEMS.map(({ key, href, icon: Icon }) => (
        <Link key={key} href={href} className="flex flex-col items-center justify-center text-muted">
          <Icon size={20} stroke={1.5} />
          <span className="mt-1 text-[10px] uppercase tracking-widest">{t(key)}</span>
        </Link>
      ))}
    </nav>
  );
}
