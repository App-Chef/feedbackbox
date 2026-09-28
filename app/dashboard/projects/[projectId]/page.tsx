import { Inbox, SearchX } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatCards } from "@/components/dashboard/stat-cards";
import { FeedbackCard } from "@/components/feedback/feedback-card";
import { FeedbackFilters } from "@/components/feedback/feedback-filters";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FEEDBACK_PAGE_SIZE } from "@/lib/constants";
import { getFeedbackList, getProject } from "@/lib/data";
import { parseFeedbackFilters } from "@/lib/validation/filters";

export default async function ProjectFeedbackPage({ params, searchParams }: PageProps<"/dashboard/projects/[projectId]">) {
  const { projectId } = await params;
  const project = await getProject(projectId);
  if (!project) notFound();

  const filters = parseFeedbackFilters(await searchParams);
  const feedback = await getFeedbackList([project.id], filters);
  const filtered = filters.q !== "" || filters.status !== "all" || filters.type !== "all";
  const base = `/dashboard/projects/${project.id}`;

  if (project.counts.total === 0) {
    return (
      <EmptyState
        icon={<Inbox className="size-5" aria-hidden="true" />}
        title="No feedback yet."
        action={<ButtonLink href={`${base}/install`}>Install widget</ButtonLink>}
      >
        Install the widget on your website and your first user message will appear here.
      </EmptyState>
    );
  }

  return (
    <div className="space-y-8">
      <StatCards counts={project.counts} baseHref={base} active={filters.status} />

      <section aria-labelledby="feedback-heading" className="space-y-4">
        <h2 id="feedback-heading" className="sr-only">
          Feedback
        </h2>
        <FeedbackFilters key={`${filters.status}-${filters.type}`} filters={filters} />

        {feedback.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-5" aria-hidden="true" />}
            title="Nothing matches."
            action={
              filtered && (
                <Link href={base} className="text-sm font-medium underline underline-offset-4">
                  Clear filters
                </Link>
              )
            }
          >
            Try a different search or filter.
          </EmptyState>
        ) : (
          <ul className="space-y-3" aria-live="polite">
            {feedback.map((f) => (
              <li key={f.id}>
                <FeedbackCard feedback={f} href={`${base}/feedback/${f.id}`} />
              </li>
            ))}
          </ul>
        )}
        {feedback.length === FEEDBACK_PAGE_SIZE && (
          <p className="text-center text-sm text-muted-fg">
            Showing the latest {FEEDBACK_PAGE_SIZE}. Use search or filters to narrow things down.
          </p>
        )}
      </section>
    </div>
  );
}
