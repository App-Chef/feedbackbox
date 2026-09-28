import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid size-7 place-items-center rounded-lg border border-line bg-accent shadow-brutal-sm",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-4 text-accent-fg" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7h16v10H9l-5 4z" />
      </svg>
    </span>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 rounded-lg", className)}>
      <LogoMark />
      <span className="font-display text-[17px] font-semibold tracking-tight">Feedbackbox</span>
    </Link>
  );
}
