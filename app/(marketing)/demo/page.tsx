import Script from "next/script";
import { ButtonLink } from "@/components/ui/button";

export const metadata = { title: "Demo" };

/** A pretend product page with the real widget running in demo mode. */
export default function DemoPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 sm:px-8">
      <div className="rounded-xl border border-dashed border-line-soft bg-accent-soft/60 px-4 py-3 text-sm">
        <strong className="font-medium">This is a demo.</strong> Click the <em>Feedback</em> button in the corner and try
        it — nothing is sent.
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface shadow-brutal">
        <div className="flex items-center gap-2 border-b border-line-soft px-4 py-3" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-line-soft" />
          <span className="size-2.5 rounded-full bg-line-soft" />
          <span className="size-2.5 rounded-full bg-line-soft" />
          <span className="ml-3 rounded-md bg-muted px-3 py-1 font-mono text-xs text-muted-fg">amazu.app/search</span>
        </div>
        <div className="p-6 sm:p-10">
          <p className="text-sm font-medium text-muted-fg">Amazu</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Find a place to stay</h1>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row" aria-hidden="true">
            <div className="h-11 flex-1 rounded-[10px] border border-line-soft bg-bg" />
            <div className="h-11 w-full rounded-[10px] border border-line bg-fg sm:w-32" />
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3" aria-hidden="true">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="rounded-xl border border-line-soft p-3">
                <div className="aspect-[4/3] rounded-lg bg-muted" />
                <div className="mt-3 h-3 w-2/3 rounded bg-muted" />
                <div className="mt-2 h-3 w-1/3 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-fg">Like it? Put it on your own site.</p>
        <ButtonLink href="/signup" className="mt-4">
          Start collecting feedback
        </ButtonLink>
      </div>

      <Script src="/widget.js" data-project="demo" data-demo="true" data-theme="auto" strategy="afterInteractive" />
    </div>
  );
}
