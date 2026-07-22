import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { SiteLoader } from "@/components/layout/site-loader";
import "../globals.css";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: "Résona",
      description: t("ogDescription"),
      locale,
      type: "website",
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
  };
}

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

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  return (
    <html lang={locale} data-theme="dark" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${ibmPlexSans.variable}`}>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('resona-theme');if(t==='light')document.documentElement.setAttribute('data-theme','light');}catch(e){}})();",
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <SiteLoader />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
