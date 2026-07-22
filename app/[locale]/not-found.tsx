import { NextIntlClientProvider } from "next-intl";
import { getTranslations, getMessages, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { NotFoundContent } from "@/components/not-found-content";

export default async function NotFound() {
  const session = await auth();
  const t = await getTranslations("errors");
  const [messages, locale] = await Promise.all([getMessages(), getLocale()]);
  return (
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
  );
}
