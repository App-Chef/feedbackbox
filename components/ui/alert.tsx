import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Alert({ tone = "danger", children, className }: {
  tone?: "danger" | "success" | "info";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "rounded-[10px] border px-3 py-2.5 text-sm animate-fade-in",
        tone === "danger" && "border-danger/30 bg-danger-soft text-danger",
        tone === "success" && "border-line-soft bg-muted text-fg",
        tone === "info" && "border-line-soft bg-surface text-muted-fg",
        className,
      )}
    >
      {children}
    </div>
  );
}
