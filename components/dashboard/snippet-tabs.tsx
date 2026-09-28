"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { SNIPPET_LABELS, type SnippetFramework } from "@/lib/snippets";
import { cn } from "@/lib/utils";

export function SnippetTabs({ snippets }: { snippets: Record<SnippetFramework, { file: string; code: string }> }) {
  const frameworks = Object.keys(snippets) as SnippetFramework[];
  const [active, setActive] = useState<SnippetFramework>("html");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const id = useId();

  function onKeyDown(e: KeyboardEvent, index: number) {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + frameworks.length) % frameworks.length;
    setActive(frameworks[next]);
    tabRefs.current[next]?.focus();
  }

  const snippet = snippets[active];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-brutal">
      <div className="flex items-center justify-between gap-2 border-b border-line-soft px-2">
        <div role="tablist" aria-label="Framework" className="flex overflow-x-auto">
          {frameworks.map((f, i) => (
            <button
              key={f}
              ref={(n) => {
                tabRefs.current[i] = n;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${f}`}
              aria-selected={active === f}
              aria-controls={`${id}-panel`}
              tabIndex={active === f ? 0 : -1}
              onClick={() => setActive(f)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "relative -mb-px h-11 border-b-2 px-3 text-sm whitespace-nowrap transition-colors duration-150",
                active === f ? "border-accent font-medium text-fg" : "border-transparent text-muted-fg hover:text-fg",
              )}
            >
              {SNIPPET_LABELS[f]}
            </button>
          ))}
        </div>
        <CopyButton text={snippet.code} className="shrink-0" />
      </div>
      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${active}`}>
        <p className="px-4 pt-3 font-mono text-xs text-muted-fg">{snippet.file}</p>
        <pre key={active} className="overflow-x-auto p-4 pt-2 font-mono text-[13px] leading-relaxed animate-fade-in">
          <code>{snippet.code}</code>
        </pre>
      </div>
    </div>
  );
}
