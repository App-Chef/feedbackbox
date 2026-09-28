"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { updateFeedbackStatus } from "@/app/dashboard/actions";
import { StatusDot } from "@/components/feedback/status-badge";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { useToast } from "@/components/ui/toast";
import { FEEDBACK_STATUSES, FEEDBACK_STATUS_LABELS, NEXT_STATUS, type FeedbackStatus } from "@/lib/constants";

const DONE_MESSAGES: Record<FeedbackStatus, string> = {
  open: "Feedback reopened",
  in_progress: "Feedback marked as in progress",
  resolved: "Feedback marked as resolved",
  archived: "Feedback archived",
};

const OPTIONS = FEEDBACK_STATUSES.map((s) => ({
  value: s,
  label: FEEDBACK_STATUS_LABELS[s],
  icon: <StatusDot status={s} />,
}));

export function useStatusChange(feedbackId: string, status: FeedbackStatus) {
  const [optimistic, setOptimistic] = useOptimistic(status);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  function change(next: FeedbackStatus) {
    startTransition(async () => {
      setOptimistic(next);
      const result = await updateFeedbackStatus(feedbackId, next);
      if (result.error) toast(result.error, "error");
      else {
        toast(DONE_MESSAGES[next]);
        router.refresh();
      }
    });
  }

  return { status: optimistic, pending, change };
}

export function StatusControl({ feedbackId, status: initial }: { feedbackId: string; status: FeedbackStatus }) {
  const { status, pending, change } = useStatusChange(feedbackId, initial);
  const next = NEXT_STATUS[status];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Dropdown
        label="Status"
        value={status}
        options={OPTIONS}
        onChange={change}
        disabled={pending}
        renderValue={(o) => (
          <span className="inline-flex items-center gap-2">
            {o.icon}
            {o.label}
          </span>
        )}
      />
      {next && (
        <Button variant="secondary" size="sm" className="h-9" onClick={() => change(next)} disabled={pending}>
          {next === "resolved" ? "Mark as resolved" : "Start working on it"}
        </Button>
      )}
      {status === "resolved" && (
        <Button variant="ghost" size="sm" className="h-9" onClick={() => change("archived")} disabled={pending}>
          Archive
        </Button>
      )}
    </div>
  );
}
