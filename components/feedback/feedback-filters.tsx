"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Spinner } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import {
  FEEDBACK_STATUSES,
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_TYPES,
  FEEDBACK_TYPE_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { filtersToSearchParams, type FeedbackFilters as Filters } from "@/lib/validation/filters";

const TYPE_SHORT_LABELS = { ...FEEDBACK_TYPE_LABELS, feature: "Feature" };

export function FeedbackFilters({ filters }: { filters: Filters }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(filters.q);
  const firstRender = useRef(true);

  function apply(next: Partial<Filters>) {
    const url = pathname + filtersToSearchParams({ ...filters, q, ...next });
    startTransition(() => router.replace(url, { scroll: false }));
  }

  // Debounce search typing so we don't query on every keystroke.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const t = setTimeout(() => apply({ q }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="space-y-3" role="search">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-fg" aria-hidden="true" />
          <label htmlFor="feedback-search" className="sr-only">
            Search feedback
          </label>
          <input
            id="feedback-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search feedback…"
            className="h-10 w-full rounded-[10px] border border-line-soft bg-surface pr-9 pl-9 text-[15px] transition-colors placeholder:text-muted-fg/70 hover:border-muted-fg focus-visible:border-line [&::-webkit-search-cancel-button]:hidden"
          />
          <span className="absolute top-1/2 right-3 -translate-y-1/2">
            {pending ? (
              <Spinner className="size-4 text-muted-fg" />
            ) : (
              q && (
                <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="grid place-items-center text-muted-fg hover:text-fg">
                  <X className="size-4" aria-hidden="true" />
                </button>
              )
            )}
          </span>
        </div>
        <div className="sm:w-48">
          <label htmlFor="feedback-type" className="sr-only">
            Filter by type
          </label>
          <Select
            id="feedback-type"
            value={filters.type}
            onChange={(e) => apply({ type: e.target.value as Filters["type"] })}
          >
            <option value="all">All types</option>
            {FEEDBACK_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_SHORT_LABELS[t]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div role="radiogroup" aria-label="Filter by status" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        {(["all", ...FEEDBACK_STATUSES] as const).map((s) => {
          const active = filters.status === s;
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => apply({ status: s })}
              className={cn(
                "h-8 shrink-0 rounded-full border px-3 text-sm transition-[background-color,border-color,color] duration-150",
                active ? "border-line bg-fg text-bg" : "border-line-soft text-muted-fg hover:border-line hover:text-fg",
              )}
            >
              {s === "all" ? "All" : FEEDBACK_STATUS_LABELS[s]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
