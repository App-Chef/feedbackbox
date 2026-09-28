import { NotFoundState } from "@/components/dashboard/not-found-state";
import { PageContainer } from "@/components/dashboard/page-header";

// Catches missing projects (notFound() thrown from the [projectId] layout).
export default function NotFound() {
  return (
    <PageContainer>
      <NotFoundState />
    </PageContainer>
  );
}
