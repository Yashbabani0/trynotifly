"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * FieldShell — label row + slot for the input + inline error.
 */
export function FieldShell({
  htmlFor,
  label,
  error,
  hint,
  children,
}: {
  htmlFor: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-[12px] font-medium tracking-tight text-foreground/85"
        >
          {label}
        </label>
        {hint}
      </div>
      {children}
      {error ? (
        <p className="text-[11.5px] leading-tight text-destructive/90">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * AuthInput — primary text input, dark surface, lime focus ring, optional icon / trailing slot.
 */
export function AuthInput({
  icon,
  trailing,
  className,
  ...props
}: React.ComponentProps<"input"> & {
  icon?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "group relative rounded-md transition-shadow duration-150",
        "focus-within:shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_18%,transparent)]",
      )}
    >
      {icon ? (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground/70 transition-colors duration-150 group-focus-within:text-primary">
          {icon}
        </span>
      ) : null}
      <input
        {...props}
        className={cn(
          "h-11 w-full rounded-md border border-border bg-card text-[13.5px] text-foreground outline-none",
          "transition-[border-color,background-color] duration-150 ease-out",
          "placeholder:text-muted-foreground/55",
          "hover:border-border/80",
          "focus:border-primary/60",
          "disabled:cursor-not-allowed disabled:opacity-55",
          icon ? "pl-10" : "px-3.5",
          trailing ? "pr-11" : icon ? "pr-3.5" : "",
          className,
        )}
      />
      {trailing ? (
        <span className="absolute inset-y-0 right-1.5 flex items-center">
          {trailing}
        </span>
      ) : null}
    </div>
  );
}

/**
 * PasswordToggle — eye / eye-off button used in the trailing slot of AuthInput.
 */
export function PasswordToggle({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      aria-label={visible ? "Hide password" : "Show password"}
      className="rounded-sm p-1.5 text-muted-foreground/70 transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
    >
      {visible ? (
        <EyeOff className="size-3.5" strokeWidth={2} />
      ) : (
        <Eye className="size-3.5" strokeWidth={2} />
      )}
    </button>
  );
}

/**
 * AuthSubmitButton — full-width lime CTA with arrow nudge and loading state.
 */
export function AuthSubmitButton({
  loading,
  loadingLabel,
  disabled,
  children,
  withArrow = true,
}: {
  loading: boolean;
  loadingLabel: string;
  disabled?: boolean;
  children: ReactNode;
  withArrow?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={cn(
        "group relative mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-[13.5px] font-semibold tracking-tight text-primary-foreground",
        "transition-[background-color,transform,box-shadow] duration-150 ease-out",
        "hover:bg-primary/90",
        "active:translate-y-px",
        "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-60",
      )}
      style={{
        boxShadow:
          "inset 0 1px 0 0 color-mix(in oklch, white 20%, transparent), 0 1px 0 0 color-mix(in oklch, black 30%, transparent)",
      }}
    >
      {loading ? (
        <>
          <Loader2 className="size-3.5 animate-spin" strokeWidth={2.5} />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          {withArrow ? (
            <ArrowRight
              className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              strokeWidth={2.5}
            />
          ) : null}
        </>
      )}
    </button>
  );
}

/**
 * AuthErrorBlock — animated inline error banner.
 */
export function AuthErrorBlock({ error }: { error: string }) {
  return (
    <AnimatePresence initial={false}>
      {error ? (
        <motion.div
          key="error"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
          className="overflow-hidden"
        >
          <div className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/6 px-3 py-2.5">
            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-destructive" />
            <p className="text-[11.5px] leading-snug text-destructive/95">
              {error}
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
