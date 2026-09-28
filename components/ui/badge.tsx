import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line-soft bg-surface px-2.5 py-0.5 text-xs font-medium text-muted-fg",
        className,
      )}
      {...props}
    />
  );
}
