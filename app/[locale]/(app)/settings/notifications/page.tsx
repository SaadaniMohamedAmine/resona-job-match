import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";
import { NotificationsForm } from "@/components/settings/notifications-form";

export default async function NotificationsSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      notifyAnalysisComplete: true,
      notifyWeeklyDigest: true,
      notifyApplicationReminders: true,
      notifyProductUpdates: true,
    },
  });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-16">
      <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12">
        <SettingsSidebar
          title="Notifications"
          description="Choose which emails Résona sends you. You can change these preferences at any time."
          active="notifications"
          insight="Keeping Analysis complete and Application reminders on helps you act on momentum right when it matters most."
        />
        <NotificationsForm initialPreferences={user} />
      </div>
    </div>
  );
}
