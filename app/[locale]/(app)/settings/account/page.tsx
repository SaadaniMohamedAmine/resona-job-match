import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";
import { AccountForm } from "@/components/settings/account-form";

export default async function AccountSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const t = await getTranslations("settings");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, bio: true, password: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-16">
      <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12">
        <SettingsSidebar
          title={t("accountPageTitle")}
          description={t("accountPageDescription")}
          active="account"
          insight={t("accountInsight")}
        />
        <AccountForm
          initialName={user.name ?? ""}
          email={user.email}
          initialBio={user.bio ?? ""}
          hasPassword={!!user.password}
        />
      </div>
    </div>
  );
}
