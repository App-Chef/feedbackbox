import { PageContainer } from "@/components/dashboard/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <PageContainer>
      <span className="sr-only" role="status">
        Loading…
      </span>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-3 h-4 w-72" />
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="mt-8 space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-xl border border-line-soft bg-surface p-5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-2.5 h-3 w-24" />
            <Skeleton className="mt-4 h-3 w-5/6" />
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
