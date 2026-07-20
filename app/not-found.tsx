import { Space_Grotesk, IBM_Plex_Sans } from "next/font/google";
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

  return (
    <html lang="en" data-theme="dark">
      <body className={`${spaceGrotesk.variable} ${ibmPlexSans.variable}`}>
        <NotFoundContent isAuthenticated={!!session?.user} />
      </body>
    </html>
  );
}
