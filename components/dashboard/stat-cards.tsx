import Link from "next/link";
import { StatusDot } from "@/components/feedback/status-badge";
import type { FeedbackStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Counts = { total: number; open: number; in_progress: number; resolved: number };

const ITEMS: Array<{ key: keyof Counts; label: string; status?: FeedbackStatus }> = [
  { key: "total", label: "Total feedback" },
  { key: "open", label: "Open", status: "open" },
  { key: "in_progress", label: "In progress", status: "in_progress" },
  { key: "resolved", label: "Resolved", status: "resolved" },
];

/** Headline counts. When `baseHref` is given, each card filters the list. */
export function StatCards({ counts, baseHref, active }: { counts: Counts; baseHref?: string; active?: string }) {
  return (
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {ITEMS.map(({ key, label, status }) => {
        const isActive = baseHref && (status ? active === status : active === "all");
        const content = (
          <>
            <dt className="flex items-center gap-2 text-sm text-muted-fg">
              {status && <StatusDot status={status} />}
              {label}
            </dt>
            <dd className="mt-2 font-display text-3xl font-semibold tracking-tight tabular-nums">{counts[key]}</dd>
          </>
        );
        const className = cn(
          "block rounded-xl border bg-surface p-4 transition-[transform,box-shadow,border-color] duration-200 ease-out",
          isActive ? "border-line shadow-brutal" : "border-line-soft",
          baseHref && "hover:-translate-px hover:border-line hover:shadow-brutal",
        );
        return baseHref ? (
          <Link
            key={key}
            href={status ? `${baseHref}?status=${status}` : baseHref}
            className={className}
            aria-current={isActive ? "true" : undefined}
          >
            {content}
          </Link>
        ) : (
          <div key={key} className={className}>
            {content}
          </div>
        );
      })}
    </dl>
  );
}
