"use client";

import { FolderKanban, LayoutGrid, LogOut, Menu, Plus, Settings, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ProjectSwitcher, type SwitcherProject } from "@/components/dashboard/project-switcher";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban, exact: false },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, exact: false },
];

function NavContent({ projects, email, onNavigate }: {
  projects: SwitcherProject[];
  email: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="px-1 pt-1">
        <Logo href="/dashboard" />
      </div>

      <ProjectSwitcher projects={projects} />

      <nav aria-label="Main">
        <ul className="space-y-0.5">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-9 items-center gap-2.5 rounded-[10px] px-2.5 text-sm transition-colors duration-150",
                    active ? "bg-muted font-medium text-fg" : "text-muted-fg hover:bg-muted/60 hover:text-fg",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Link
        href="/dashboard/projects?new=1"
        onClick={onNavigate}
        className="flex h-9 items-center gap-2.5 rounded-[10px] border border-dashed border-line-soft px-2.5 text-sm text-muted-fg transition-colors hover:border-line hover:text-fg"
      >
        <Plus className="size-4" aria-hidden="true" />
        New project
      </Link>

      <div className="mt-auto space-y-3 border-t border-line-soft pt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs text-muted-fg" title={email}>
            {email}
          </span>
          <ThemeToggle />
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex h-9 w-full items-center gap-2.5 rounded-[10px] px-2.5 text-sm text-muted-fg transition-colors hover:bg-muted/60 hover:text-fg"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

export function DashboardShell({ projects, email, children }: {
  projects: SwitcherProject[];
  email: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile drawer whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const drawerRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;
    if (open && !drawer.open) drawer.showModal();
    if (!open && drawer.open) drawer.close();
  }, [open]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[256px_1fr]">
      <aside className="sticky top-0 hidden h-dvh border-r border-line-soft bg-bg lg:block">
        <NavContent projects={projects} email={email} />
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line-soft bg-bg/90 px-4 backdrop-blur lg:hidden">
        <Logo href="/dashboard" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="grid size-10 place-items-center rounded-[10px] border border-line-soft"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
      </header>

      {/* Native <dialog> gives the drawer a focus trap and inert background. */}
      <dialog
        ref={drawerRef}
        id="mobile-nav"
        aria-label="Menu"
        onCancel={(e) => {
          e.preventDefault();
          setOpen(false);
        }}
        onClick={(e) => e.target === drawerRef.current && setOpen(false)}
        className="m-0 h-dvh max-h-none w-[min(20rem,85vw)] border-r border-line bg-bg p-0 text-fg animate-slide-in-left lg:hidden"
      >
        {open && (
          <div className="relative h-full">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute top-4 right-3 grid size-8 place-items-center rounded-lg text-muted-fg hover:bg-muted"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
            <NavContent projects={projects} email={email} onNavigate={() => setOpen(false)} />
          </div>
        )}
      </dialog>

      <main id="main" className="min-w-0">
        {children}
      </main>
    </div>
  );
}
