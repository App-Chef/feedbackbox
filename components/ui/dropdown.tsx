"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DropdownOption<T extends string> = { value: T; label: string; icon?: ReactNode };

/** Single-select menu button with full keyboard support. */
export function Dropdown<T extends string>({
  value,
  options,
  onChange,
  label,
  renderValue,
  align = "start",
  disabled,
  className,
}: {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  /** Accessible name, e.g. "Status". */
  label: string;
  renderValue?: (option: DropdownOption<T>) => ReactNode;
  align?: "start" | "end";
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = useId();
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    const index = Math.max(0, options.findIndex((o) => o.value === value));
    itemRefs.current[index]?.focus();
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, options, value]);

  function close(focusButton = true) {
    setOpen(false);
    if (focusButton) buttonRef.current?.focus();
  }

  function onMenuKeyDown(e: KeyboardEvent) {
    const items = itemRefs.current.filter(Boolean) as HTMLButtonElement[];
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    const move = (i: number) => items[(i + items.length) % items.length]?.focus();

    if (e.key === "ArrowDown") move(current + 1);
    else if (e.key === "ArrowUp") move(current - 1);
    else if (e.key === "Home") move(0);
    else if (e.key === "End") move(items.length - 1);
    else if (e.key === "Escape") close();
    else if (e.key === "Tab") return setOpen(false);
    else return;
    e.preventDefault();
  }

  return (
    <div ref={rootRef} className={cn("relative inline-block", className)}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`${label}: ${selected.label}`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-[10px] border border-line bg-surface px-3 text-sm font-medium",
          "shadow-brutal-sm transition-[transform,box-shadow] duration-150 ease-out hover:-translate-px hover:shadow-brutal",
          "disabled:opacity-60",
        )}
      >
        {renderValue ? renderValue(selected) : selected.label}
        <ChevronDown
          className={cn("size-4 text-muted-fg transition-transform duration-200", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKeyDown}
          className={cn(
            "absolute z-30 mt-2 min-w-48 rounded-xl border border-line bg-surface p-1 shadow-brutal animate-pop",
            align === "end" ? "right-0 origin-top-right" : "left-0 origin-top-left",
          )}
        >
          {options.map((option, i) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                ref={(node) => {
                  itemRefs.current[i] = node;
                }}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                tabIndex={-1}
                onClick={() => {
                  close();
                  if (!active) onChange(option.value);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm outline-none",
                  "transition-colors duration-100 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                  active && "font-medium",
                )}
              >
                {option.icon}
                <span className="flex-1">{option.label}</span>
                {active && <Check className="size-4" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
