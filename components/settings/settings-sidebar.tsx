import Link from "next/link";
import { useTranslations } from "next-intl";

export function SettingsSidebar({
  title,
  description,
  active,
  insight,
}: {
  title: string;
  description: string;
  active: "account" | "notifications" | "billing";
  insight: string;
}) {
  const t = useTranslations("settings");

  const TABS = [
    { href: "/settings/account", label: t("accountTab") },
    { href: "/settings/notifications", label: t("notificationsTab") },
    { href: "/settings/billing", label: t("billingTab") },
  ];

  return (
    <aside className="space-y-8 lg:col-span-4">
      <div>
        <h1 className="mb-4 font-display text-3xl font-bold text-base-light">{title}</h1>
        <p className="leading-relaxed text-muted">{description}</p>
      </div>

      <nav className="flex border-b border-track lg:flex-col lg:border-b-0 lg:border-l">
        {TABS.map((tab) => {
          const isActive = tab.href === `/settings/${active}`;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`-ml-px border-b-2 px-6 py-4 text-left text-sm transition-all lg:border-b-0 lg:border-l-2 ${
                isActive ? "border-accent text-accent" : "border-transparent text-muted hover:text-accent"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-(--radius-card) border border-track bg-track/20 p-6">
        <span className="mb-2 block text-xs tracking-widest text-accent uppercase">
          {t("expertInsight")}
        </span>
        <p className="text-sm text-muted italic">&quot;{insight}&quot;</p>
      </div>
    </aside>
  );
}
