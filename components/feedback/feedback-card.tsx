import Link from "next/link";
import { StatusBadge, TypeLabel } from "@/components/feedback/status-badge";
import type { Feedback } from "@/lib/supabase/types";
import { cn, feedbackTitle, pathFromUrl, timeAgo } from "@/lib/utils";

export function FeedbackCard({ feedback, href, projectName }: {
  feedback: Feedback;
  href: string;
  projectName?: string;
}) {
  const title = feedbackTitle(feedback.message);
  const rest = feedback.message.trim().slice(title.replace(/…$/, "").length).trim();
  const path = pathFromUrl(feedback.page_url);

  return (
    <Link
      href={href}
      className={cn(
        "group block rounded-xl border border-line-soft bg-surface p-4 sm:p-5",
        "transition-[transform,box-shadow,border-color] duration-200 ease-out",
        "hover:-translate-x-px hover:-translate-y-px hover:border-line hover:shadow-brutal",
        "focus-visible:border-line",
        feedback.status === "archived" && "opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-medium text-fg">{title}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <TypeLabel type={feedback.type} />
            {projectName && <span className="text-xs text-muted-fg">· {projectName}</span>}
          </div>
        </div>
        <StatusBadge status={feedback.status} className="shrink-0" />
      </div>
      {rest && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-fg">{rest}</p>}
      <div className="mt-4 flex items-center gap-3 text-xs text-muted-fg">
        <time dateTime={feedback.created_at}>{timeAgo(feedback.created_at)}</time>
        {path && <span className="truncate font-mono">{path}</span>}
        {feedback.email && <span className="ml-auto hidden truncate sm:inline">{feedback.email}</span>}
      </div>
    </Link>
  );
}
