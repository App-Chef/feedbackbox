import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <EmptyState
      title="Not found."
      action={<ButtonLink href="/dashboard/projects" variant="secondary">Back to projects</ButtonLink>}
    >
      This doesn&apos;t exist, or it belongs to someone else.
    </EmptyState>
  );
}
