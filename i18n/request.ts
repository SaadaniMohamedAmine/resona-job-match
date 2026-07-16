import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export default getRequestConfig(async ({ locale }) => ({
  locale: locale ?? defaultLocale,
  messages: (await import(`../messages/${locale ?? defaultLocale}.json`)).default,
}));
