import { SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function NotFoundState() {
  return (
    <EmptyState
      icon={<SearchX className="size-5" aria-hidden="true" />}
      title="Not found."
      action={
        <ButtonLink href="/dashboard/projects" variant="secondary">
          Back to projects
        </ButtonLink>
      }
    >
      This doesn&apos;t exist, or it belongs to someone else.
    </EmptyState>
  );
}
