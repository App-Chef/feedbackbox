"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/dashboard/projects/${projectId}`;
  const tabs = [
    { href: base, label: "Feedback", active: pathname === base || pathname.startsWith(`${base}/feedback`) },
    { href: `${base}/install`, label: "Install widget", active: pathname.startsWith(`${base}/install`) },
    { href: `${base}/settings`, label: "Settings", active: pathname.startsWith(`${base}/settings`) },
  ];

  return (
    <nav aria-label="Project" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex gap-1 border-b border-line-soft">
        {tabs.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              aria-current={t.active ? "page" : undefined}
              className={cn(
                "relative -mb-px inline-flex h-10 items-center border-b-2 px-3 text-sm whitespace-nowrap transition-colors duration-150",
                t.active ? "border-accent font-medium text-fg" : "border-transparent text-muted-fg hover:text-fg",
              )}
            >
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
