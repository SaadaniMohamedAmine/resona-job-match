const JUST_NOW: Record<string, string> = { en: "Just now", fr: "À l'instant" };

export function formatRelativeTime(date: Date, locale: string = "en"): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return JUST_NOW[locale] ?? JUST_NOW.en;

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffMin < 60) return rtf.format(-diffMin, "minute");
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return rtf.format(-diffHours, "hour");
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return rtf.format(-diffDays, "day");
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(date);
}
