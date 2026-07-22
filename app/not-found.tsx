import { Space_Grotesk, IBM_Plex_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, getMessages, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { NotFoundContent } from "@/components/not-found-content";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
});

export default async function GlobalNotFound() {
  const session = await auth();
  const t = await getTranslations("errors");
  const [messages, locale] = await Promise.all([getMessages(), getLocale()]);

  return (
    <html lang={locale} data-theme="dark">
      <body className={`${spaceGrotesk.variable} ${ibmPlexSans.variable}`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <NotFoundContent
            isAuthenticated={!!session?.user}
            errorCodeLabel={t("errorCode404")}
            title={t("notFoundTitle")}
            body={t("notFoundBody")}
            backToDashboardLabel={t("backToDashboard")}
            backToHomeLabel={t("backToHome")}
            systemHistoryLabel={t("systemHistory")}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
