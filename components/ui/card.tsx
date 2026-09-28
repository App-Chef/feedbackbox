import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, raised, ...props }: ComponentProps<"div"> & { raised?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-surface",
        raised ? "border-line shadow-brutal" : "border-line-soft",
        className,
      )}
      {...props}
    />
  );
}
