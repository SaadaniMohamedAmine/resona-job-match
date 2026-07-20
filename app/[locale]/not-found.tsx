import { auth } from "@/lib/auth";
import { NotFoundContent } from "@/components/not-found-content";

export default async function NotFound() {
  const session = await auth();
  return <NotFoundContent isAuthenticated={!!session?.user} />;
}
