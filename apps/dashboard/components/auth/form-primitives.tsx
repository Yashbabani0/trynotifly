"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * FieldShell — label row + slot for the input + inline error.
 * Used for every field across every auth form.
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
          className="font-mono text-[10.5px] font-medium tracking-[0.14em] text-muted-foreground/90 uppercase"
        >
          {label}
        </label>
        {hint}
      </div>
      {children}
      {error ? (
        <p className="text-[11px] leading-tight text-destructive">{error}</p>
      ) : null}
    </div>
  );
}

/**
 * AuthInput — the styled `<input>` shared by every auth form.
 * Supports left icon and a trailing slot (eye toggle, etc.).
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
        "group relative rounded-md transition-shadow duration-200",
        "focus-within:shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_14%,transparent)]",
      )}
    >
      {icon ? (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground/80 transition-colors duration-200 group-focus-within:text-foreground">
          {icon}
        </span>
      ) : null}
      <input
        {...props}
        className={cn(
          "h-10 w-full rounded-md border border-border/70 bg-card/30 px-3 text-[13px] text-foreground outline-none",
          "transition-[border-color,background-color,color] duration-200 ease-out",
          "placeholder:text-muted-foreground/55",
          "hover:border-border hover:bg-card/45",
          "focus:border-primary/45 focus:bg-card/55",
          "disabled:cursor-not-allowed disabled:opacity-55",
          icon ? "pl-9" : "",
          trailing ? "pr-10" : "",
          className,
        )}
        style={{
          boxShadow:
            "inset 0 1px 0 0 color-mix(in oklch, var(--foreground) 4%, transparent), inset 0 0 0 1px color-mix(in oklch, black 18%, transparent)",
        }}
      />
      {trailing ? (
        <span className="absolute inset-y-0 right-2 flex items-center">
          {trailing}
        </span>
      ) : null}
    </div>
  );
}

/**
 * PasswordToggle — eye / eye-off button paired with AuthInput's trailing slot.
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
      className="rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
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
 * AuthSubmitButton — the primary CTA with sheen wipe and arrow nudge.
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
        "group relative mt-1 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-md bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground",
        "transition-all duration-200 ease-out",
        "hover:-translate-y-px hover:bg-primary/95",
        "active:translate-y-0",
        "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-70",
      )}
      style={{
        boxShadow:
          "inset 0 1px 0 0 color-mix(in oklch, white 25%, transparent), inset 0 0 0 1px color-mix(in oklch, var(--primary) 40%, transparent), 0 1px 0 0 color-mix(in oklch, black 30%, transparent), 0 6px 16px -6px color-mix(in oklch, var(--primary) 35%, transparent)",
      }}
    >
      <span
        aria-hidden
        className="absolute inset-0 -translate-x-full opacity-0 transition-all duration-500 ease-out group-hover:translate-x-full group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(110deg, transparent 30%, color-mix(in oklch, white 18%, transparent) 50%, transparent 70%)",
        }}
      />
      {loading ? (
        <>
          <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          {withArrow ? (
            <ArrowRight
              className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              strokeWidth={2.25}
            />
          ) : null}
        </>
      )}
    </button>
  );
}

/**
 * AuthErrorBlock — animated inline error banner displayed beneath inputs.
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
            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-destructive shadow-[0_0_6px_color-mix(in_oklch,var(--destructive)_55%,transparent)]" />
            <p className="text-[11.5px] leading-snug text-destructive/95">
              {error}
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
