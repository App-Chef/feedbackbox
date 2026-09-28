"use client";

import { ChevronsUpDown, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export type SwitcherProject = { id: string; name: string; open: number };

/** Jump between projects. A menu of links with arrow-key navigation. */
export function ProjectSwitcher({ projects }: { projects: SwitcherProject[] }) {
  const params = useParams<{ projectId?: string }>();
  const current = projects.find((p) => p.id === params.projectId);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    menuRef.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function onKeyDown(e: KeyboardEvent) {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") items[(i + 1) % items.length]?.focus();
    else if (e.key === "ArrowUp") items[(i - 1 + items.length) % items.length]?.focus();
    else if (e.key === "Escape") {
      setOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === "Tab") return setOpen(false);
    else return;
    e.preventDefault();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center gap-2.5 rounded-xl border border-line bg-surface px-3 text-left shadow-brutal-sm transition-[transform,box-shadow] duration-150 hover:-translate-px hover:shadow-brutal"
      >
        <span className="grid size-6 shrink-0 place-items-center rounded-md bg-accent-soft font-display text-xs font-semibold">
          {(current?.name ?? "P").slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] leading-tight text-muted-fg">Project</span>
          <span className="block truncate text-sm font-medium leading-tight">
            {current?.name ?? (projects.length ? "Select a project" : "No projects yet")}
          </span>
        </span>
        <ChevronsUpDown className="size-4 text-muted-fg" aria-hidden="true" />
      </button>

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Projects"
          onKeyDown={onKeyDown}
          className="absolute inset-x-0 z-30 mt-2 max-h-80 overflow-auto rounded-xl border border-line bg-surface p-1 shadow-brutal animate-pop"
        >
          {projects.map((p) => (
            <Link
              key={p.id}
              role="menuitem"
              href={`/dashboard/projects/${p.id}`}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted",
                p.id === current?.id && "font-medium",
              )}
            >
              <span className="truncate">{p.name}</span>
              {p.open > 0 && <span className="text-xs text-muted-fg">{p.open} open</span>}
            </Link>
          ))}
          <Link
            role="menuitem"
            href="/dashboard/projects?new=1"
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center gap-2 rounded-lg border-t border-line-soft px-2.5 py-2 text-sm text-muted-fg outline-none hover:bg-muted hover:text-fg focus-visible:bg-muted"
          >
            <Plus className="size-4" aria-hidden="true" />
            New project
          </Link>
        </div>
      )}
    </div>
  );
}
