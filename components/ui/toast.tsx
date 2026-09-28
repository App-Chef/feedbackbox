"use client";

import { Check, CircleAlert } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "success" | "error";
type ToastItem = { id: number; message: string; tone: Tone; leaving?: boolean };

const ToastContext = createContext<((message: string, tone?: Tone) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const toast = useCallback((message: string, tone: Tone = "success") => {
    const id = ++nextId.current;
    setToasts((all) => [...all.slice(-2), { id, message, tone }]);
    setTimeout(() => setToasts((all) => all.map((t) => (t.id === id ? { ...t, leaving: true } : t))), 3200);
    setTimeout(() => setToasts((all) => all.filter((t) => t.id !== id)), 3400);
  }, []);

  const value = useMemo(() => toast, [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium shadow-brutal",
              "transition-[opacity,transform] duration-200 ease-out animate-rise",
              t.leaving && "translate-y-1 opacity-0",
            )}
          >
            {t.tone === "success" ? (
              <span className="grid size-5 place-items-center rounded-full bg-accent text-accent-fg">
                <Check className="size-3" strokeWidth={3} aria-hidden="true" />
              </span>
            ) : (
              <CircleAlert className="size-5 text-danger" aria-hidden="true" />
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
