import { X } from "lucide-react";

/** Static illustration of the widget for the landing page. */
export function WidgetMock() {
  return (
    <div className="relative mx-auto w-full max-w-sm" aria-hidden="true">
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-brutal-lg">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Give feedback</p>
          <X className="size-4 text-muted-fg" />
        </div>
        <p className="mt-4 text-[13px] font-semibold">What would you like to tell us?</p>
        <div className="mt-1.5 rounded-[10px] border border-line-soft bg-bg p-3 text-sm leading-relaxed">
          I think the search could be faster. Could it filter by location too?
          <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-fg motion-reduce:animate-none" />
        </div>
        <p className="mt-3 text-[13px] font-semibold">Type</p>
        <div className="mt-1.5 flex items-center justify-between rounded-[10px] border border-line-soft bg-bg px-3 py-2 text-sm">
          Feature request <span className="text-muted-fg">▾</span>
        </div>
        <p className="mt-3 text-[13px] font-semibold">
          Email <span className="font-normal text-muted-fg">(optional)</span>
        </p>
        <div className="mt-1.5 rounded-[10px] border border-line-soft bg-bg px-3 py-2 text-sm text-muted-fg">you@example.com</div>
        <div className="mt-4 flex justify-end">
          <span className="rounded-[10px] border border-line bg-accent px-4 py-2 text-sm font-semibold text-accent-fg shadow-brutal-sm">
            Send feedback
          </span>
        </div>
      </div>
    </div>
  );
}
