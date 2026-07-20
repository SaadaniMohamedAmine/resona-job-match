import { Wordmark } from "@/components/ui/wordmark";
import { LoaderRing } from "@/components/ui/loader-ring";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-1 flex-col items-center justify-center gap-6 px-4">
      <div className="animate-pulse">
        <Wordmark />
      </div>
      <LoaderRing size={40} />
    </div>
  );
}
