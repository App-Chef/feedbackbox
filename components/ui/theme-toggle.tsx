"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";
const KEY = "fbx-theme";
const listeners = new Set<() => void>();

function read(): Theme {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

function toggleTheme() {
  const current = read();
  const next = current === "dark" ? "light" : "dark";
  try {
    localStorage.setItem(KEY, next);
  } catch {}
  applyTheme(next);
  listeners.forEach((l) => l());
}

/** Inline script that sets the theme before first paint (no flash). */
export const themeScript = `(function(){try{var t=localStorage.getItem('${KEY}');document.documentElement.dataset.theme=t==='light'?'light':'dark'}catch(e){document.documentElement.dataset.theme='dark'}})()`;

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => "dark" as Theme,
  );

  const isDark = theme === "dark";
  const Icon = isDark ? Sun : Moon;
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-9 place-items-center rounded-[10px] border border-line-soft text-muted-fg transition-colors hover:bg-muted hover:text-fg",
        className,
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}
