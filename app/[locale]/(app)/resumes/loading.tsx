import { SkeletonHistory } from "@/components/ui/skeleton-history";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-16">
      <SkeletonHistory />
    </div>
  );
}
