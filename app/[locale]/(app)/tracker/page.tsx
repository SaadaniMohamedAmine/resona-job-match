import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TrackerBoard } from "@/components/tracker/tracker-board";

export default async function TrackerPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <TrackerBoard />;
}
