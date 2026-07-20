import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { SiteLoader } from "@/components/layout/site-loader";
import "../globals.css";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  return {
    title: "Résona — Your resume, aligned to every opportunity.",
    description:
      "AI-powered resume and job-match analysis. Get your match score, close the gaps, and rewrite your resume for every application.",
    openGraph: {
      title: "Résona",
      description: "Your resume, aligned to every opportunity.",
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
    <html lang={locale} data-theme="dark">
      <body className={`${spaceGrotesk.variable} ${ibmPlexSans.variable}`}>
        <SiteLoader />
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
