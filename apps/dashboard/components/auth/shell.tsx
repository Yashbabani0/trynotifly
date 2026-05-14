import Link from "next/link";
import type { ReactNode } from "react";
import { Bell } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * AuthShell — minimal centered container for every auth page.
 * Top: brand mark. Middle: page content (eyebrow → heading → form). Bottom: footer.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between px-6 pt-8 sm:px-10 sm:pt-10">
        <BrandMark />
      </header>

      <main className="flex flex-1 items-center justify-center px-5 pt-8 pb-20 sm:px-6">
        <div className="w-full max-w-[26rem] sm:max-w-[28rem]">{children}</div>
      </main>

      <AuthFooter />
    </div>
  );
}

/**
 * BrandMark — small TryNotifly icon + wordmark, used at the top of every auth page.
 */
export function BrandMark() {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <span
        className="relative flex size-7 items-center justify-center rounded-md border border-border bg-card transition-colors duration-200 group-hover:border-primary/30"
        style={{
          boxShadow:
            "inset 0 0 0 1px color-mix(in oklch, var(--primary) 12%, transparent)",
        }}
      >
        <Bell className="size-3.5 text-primary" strokeWidth={2.25} />
      </span>
      <span className="text-[14px] font-semibold tracking-tight text-foreground">
        TryNotifly
      </span>
    </Link>
  );
}

/**
 * AuthHeader — small uppercase route label, heading, and supporting copy.
 */
export function AuthHeader({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 space-y-3", className)}>
      <p className="font-mono text-[10.5px] tracking-[0.22em] text-primary/85 uppercase">
        {eyebrow}
      </p>
      <h1 className="text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] text-foreground">
        {title}
      </h1>
      {description ? (
        <p className="max-w-[34ch] text-[13.5px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}

/**
 * AuthDivider — slim separator between OAuth and credentials.
 */
export function AuthDivider({ label = "or continue with" }: { label?: string }) {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground/70 uppercase">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

/**
 * AuthBottomLink — the "Don't have an account? Sign up" line beneath the form.
 */
export function AuthBottomLink({
  prompt,
  href,
  cta,
}: {
  prompt: string;
  href: string;
  cta: string;
}) {
  return (
    <p className="mt-7 text-center text-[12.5px] text-muted-foreground">
      {prompt}{" "}
      <Link
        href={href}
        className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
      >
        {cta}
      </Link>
    </p>
  );
}

/**
 * AuthFooter — minimal copyright + operational status row pinned to the bottom.
 */
export function AuthFooter() {
  return (
    <footer className="flex items-center justify-between border-t border-border/60 px-6 py-5 text-[10px] text-muted-foreground/80 sm:px-10">
      <span className="font-mono tracking-[0.16em] uppercase">
        © {new Date().getFullYear()} TryNotifly
      </span>
      <div className="flex items-center gap-2">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
          <span className="relative inline-flex size-1.5 rounded-full bg-primary shadow-[0_0_6px_color-mix(in_oklch,var(--primary)_60%,transparent)]" />
        </span>
        <span className="font-mono tracking-[0.16em] uppercase">
          All systems operational
        </span>
      </div>
    </footer>
  );
}
