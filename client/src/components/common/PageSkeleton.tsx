import { Skeleton } from "@/components/ui/skeleton";

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-5 py-16">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export { PageSkeleton };
