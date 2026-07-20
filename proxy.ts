import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/request";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
});

export const config = {
  matcher: [
    "/((?!api|_next|icon|apple-icon|opengraph-image|twitter-image|manifest|robots|sitemap|.*\\..*).*)",
  ],
};
