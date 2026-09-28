import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({ icon, title, children, action, className }: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border border-dashed border-line-soft px-6 py-14 text-center animate-rise",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 grid size-12 place-items-center rounded-xl border border-line bg-accent-soft text-fg shadow-brutal-sm">
          {icon}
        </div>
      )}
      <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
      {children && <div className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-fg">{children}</div>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
