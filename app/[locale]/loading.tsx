import { Wordmark } from "@/components/ui/wordmark";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-1 flex-col items-center justify-center px-4">
      <div className="animate-pulse">
        <Wordmark />
      </div>
    </div>
  );
}
