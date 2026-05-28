"use client";

import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function TextField({
  label,
  error,
  className,
  type = "text",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="relative mt-2 block">
        <input
          className={cn(
            "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20",
            isPassword && "pr-10",
            error && "border-destructive focus:border-destructive focus:ring-destructive/20",
            className,
          )}
          type={isPassword && visible ? "text" : type}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <IconEyeOff size={16} /> : <IconEye size={16} />}
          </button>
        ) : null}
      </span>
      {error ? <span className="mt-1 block text-sm text-destructive">{error}</span> : null}
    </label>
  );
}

export function SelectField({
  label,
  error,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <select
        className={cn(
          "mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20",
          error && "border-destructive focus:border-destructive focus:ring-destructive/20",
        )}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="mt-1 block text-sm text-destructive">{error}</span> : null}
    </label>
  );
}

export function InlineNotice({
  tone = "default",
  children,
}: {
  tone?: "default" | "success" | "error";
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
      : tone === "error"
        ? "border-destructive/30 bg-destructive/10 text-destructive"
        : "border-border bg-muted text-muted-foreground";

  return (
    <div className={cn("rounded-lg border px-3 py-2 text-sm", toneClass)}>
      {children}
    </div>
  );
}

export function Toast({
  tone = "default",
  message,
}: {
  tone?: "default" | "success" | "error";
  message: string | null;
}) {
  if (!message) {
    return null;
  }

  const toneClass =
    tone === "success"
      ? "border-emerald-500/30 bg-emerald-950 text-emerald-50"
      : tone === "error"
        ? "border-destructive/30 bg-destructive text-white"
        : "border-border bg-foreground text-background";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm shadow-lg",
        toneClass,
      )}
    >
      {message}
    </div>
  );
}
