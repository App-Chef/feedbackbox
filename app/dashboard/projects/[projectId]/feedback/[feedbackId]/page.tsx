import { ArrowLeft, ExternalLink, Mail } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { DeleteFeedbackButton } from "@/components/feedback/delete-feedback";
import { TypeLabel } from "@/components/feedback/status-badge";
import { StatusControl } from "@/components/feedback/status-control";
import { Card } from "@/components/ui/card";
import { getFeedback } from "@/lib/data";
import { feedbackTitle, formatDate, pathFromUrl, timeAgo } from "@/lib/utils";

export const metadata = { title: "Feedback" };

export default async function FeedbackDetailPage({ params }: PageProps<"/dashboard/projects/[projectId]/feedback/[feedbackId]">) {
  const { projectId, feedbackId } = await params;
  if (!z.uuid().safeParse(feedbackId).success) notFound();

  const feedback = await getFeedback(feedbackId);
  if (!feedback || feedback.project_id !== projectId) notFound();

  const device = [feedback.browser, feedback.os].filter(Boolean).join(" on ");
  const screen = feedback.screen_width && feedback.screen_height ? `${feedback.screen_width} × ${feedback.screen_height}` : null;

  return (
    <article className="mx-auto max-w-2xl">
      <Link
        href={`/dashboard/projects/${projectId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-fg transition-colors hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to feedback
      </Link>

      <header className="mt-6">
        <TypeLabel type={feedback.type} />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-balance">
          {feedbackTitle(feedback.message, 120)}
        </h2>
      </header>

      <div className="mt-6">
        <StatusControl key={feedback.status} feedbackId={feedback.id} status={feedback.status} />
      </div>

      <Card raised className="mt-8 p-5 sm:p-6">
        <h3 className="text-xs font-medium tracking-wide text-muted-fg uppercase">Message</h3>
        <blockquote className="mt-3 text-[15px] leading-relaxed break-words whitespace-pre-wrap">{feedback.message}</blockquote>
      </Card>

      <dl className="mt-8 grid gap-x-8 gap-y-5 text-sm sm:grid-cols-2">
        <Meta label="Submitted">
          <time dateTime={feedback.created_at} title={new Date(feedback.created_at).toISOString()}>
            {formatDate(feedback.created_at)} · {timeAgo(feedback.created_at)}
          </time>
        </Meta>
        <Meta label="Page">
          {feedback.page_url && /^https?:\/\//.test(feedback.page_url) ? (
            <a
              href={feedback.page_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex max-w-full items-center gap-1 font-mono text-[13px] underline decoration-line-soft underline-offset-4 hover:decoration-fg"
            >
              <span className="truncate">{pathFromUrl(feedback.page_url)}</span>
              <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
            </a>
          ) : (
            <span className="text-muted-fg">Unknown</span>
          )}
        </Meta>
        <Meta label="Email">
          {feedback.email ? (
            <a
              href={`mailto:${feedback.email}`}
              className="inline-flex items-center gap-1.5 underline decoration-line-soft underline-offset-4 hover:decoration-fg"
            >
              <Mail className="size-3.5" aria-hidden="true" />
              {feedback.email}
            </a>
          ) : (
            <span className="text-muted-fg">Anonymous</span>
          )}
        </Meta>
        <Meta label="Device">
          {device || screen ? (
            <span>
              {device}
              {device && screen && <span className="text-muted-fg"> · </span>}
              {screen && <span className="text-muted-fg">{screen}</span>}
            </span>
          ) : (
            <span className="text-muted-fg">Unknown</span>
          )}
        </Meta>
      </dl>

      <div className="mt-10 flex justify-end border-t border-line-soft pt-4">
        <DeleteFeedbackButton feedbackId={feedback.id} projectId={projectId} />
      </div>
    </article>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium tracking-wide text-muted-fg uppercase">{label}</dt>
      <dd className="mt-1.5 min-w-0">{children}</dd>
    </div>
  );
}
