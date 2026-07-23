import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppNavbar } from "@/components/layout/app-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { ScrollToTop } from "@/components/layout/scroll-to-top";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <AppNavbar locale={locale} user={session.user} />
      <main className="flex flex-1 flex-col">{children}</main>
      <PublicFooter />
      <ScrollToTop />
    </div>
  );
}
