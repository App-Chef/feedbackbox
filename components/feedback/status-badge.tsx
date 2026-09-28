import { Badge } from "@/components/ui/badge";
import { FEEDBACK_STATUS_LABELS, FEEDBACK_TYPE_LABELS, type FeedbackStatus, type FeedbackType } from "@/lib/constants";
import { cn } from "@/lib/utils";

const dot: Record<FeedbackStatus, string> = {
  open: "bg-[var(--status-open)]",
  in_progress: "bg-[var(--status-progress)]",
  resolved: "bg-[var(--status-resolved)]",
  archived: "bg-[var(--status-archived)]",
};

export function StatusDot({ status, className }: { status: FeedbackStatus; className?: string }) {
  return <span aria-hidden="true" className={cn("inline-block size-2 shrink-0 rounded-full", dot[status], className)} />;
}

export function StatusBadge({ status, className }: { status: FeedbackStatus; className?: string }) {
  return (
    <Badge className={cn("text-fg", className)}>
      <StatusDot status={status} />
      {FEEDBACK_STATUS_LABELS[status]}
    </Badge>
  );
}

export function TypeLabel({ type, className }: { type: FeedbackType; className?: string }) {
  return (
    <span className={cn("text-xs font-medium tracking-wide text-muted-fg uppercase", className)}>
      {FEEDBACK_TYPE_LABELS[type]}
    </span>
  );
}
