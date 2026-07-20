import Link from "next/link";
import { IconUpload, IconChartBar, IconClipboardCheck } from "@tabler/icons-react";

const ITEMS = [
  { label: "Upload", href: "/upload", icon: IconUpload },
  { label: "Analyze", href: "/analyzing", icon: IconChartBar },
  { label: "Results", href: "/resumes", icon: IconClipboardCheck },
];

export function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-track bg-[var(--color-track)] py-3 md:hidden">
      {ITEMS.map(({ label, href, icon: Icon }) => (
        <Link key={label} href={href} className="flex flex-col items-center justify-center text-muted">
          <Icon size={20} stroke={1.5} />
          <span className="mt-1 text-[10px] uppercase tracking-widest">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
