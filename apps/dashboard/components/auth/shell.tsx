import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Bell } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * AuthShell — the split-screen container shared by every auth page.
 * Left panel is supplied by the page; right panel hosts the form / content.
 */
export function AuthShell({
  leftPanel,
  topRight,
  mobileTopRight,
  children,
}: {
  leftPanel: ReactNode;
  topRight?: ReactNode;
  mobileTopRight?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-background text-foreground lg:grid-cols-[1.05fr_1fr]">
      {leftPanel}
      <section className="relative flex flex-col px-5 py-10 sm:px-12 lg:px-16 lg:py-14 xl:px-20">
        {/* Mobile brand row */}
        <div className="mb-12 flex items-center justify-between lg:hidden">
          <BrandMark size="sm" />
          {mobileTopRight}
        </div>

        {/* Desktop top-right slot */}
        {topRight ? (
          <div className="absolute top-10 right-10 hidden lg:flex lg:items-center lg:gap-2.5">
            {topRight}
          </div>
        ) : null}

        <div className="mx-auto flex w-full max-w-104 flex-1 flex-col justify-center">
          {children}
        </div>

        <AuthFooter />
      </section>
    </div>
  );
}

/**
 * BrandMark — the TryNotifly icon + wordmark.
 * Used in the left panel (size="md") and the mobile header (size="sm").
 */
export function BrandMark({
  size = "md",
  showSlash = true,
}: {
  size?: "sm" | "md";
  showSlash?: boolean;
}) {
  const isMd = size === "md";
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={cn(
          "relative flex items-center justify-center rounded-md border bg-card/60",
          isMd
            ? "size-8 border-border/80"
            : "size-7 border-border/70 bg-card/50",
        )}
        style={{
          boxShadow: isMd
            ? "inset 0 1px 0 0 color-mix(in oklch, var(--foreground) 6%, transparent), inset 0 0 0 1px color-mix(in oklch, var(--primary) 18%, transparent)"
            : "inset 0 1px 0 0 color-mix(in oklch, var(--foreground) 5%, transparent)",
        }}
      >
        <Bell
          className={cn(isMd ? "size-4" : "size-3.5", "text-primary")}
          strokeWidth={2.25}
        />
        {isMd ? (
          <span
            aria-hidden
            className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-primary shadow-[0_0_6px_color-mix(in_oklch,var(--primary)_70%,transparent)]"
          />
        ) : null}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-semibold tracking-tight",
            isMd ? "text-[15px]" : "text-sm",
          )}
        >
          TryNotifly
        </span>
        {showSlash && isMd ? (
          <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground/80 uppercase">
            / dashboard
          </span>
        ) : null}
      </div>
    </div>
  );
}

/**
 * AuthHeader — eyebrow + heading + supporting copy block, centered above the form.
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
    <div className={cn("mb-8 space-y-2.5", className)}>
      <p className="font-mono text-[10px] tracking-[0.22em] text-primary/90 uppercase">
        {eyebrow}
      </p>
      <h2 className="text-[1.65rem] leading-[1.15] font-medium tracking-[-0.015em]">
        {title}
      </h2>
      {description ? (
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}

/**
 * AuthFooter — operational status line shared by every auth page.
 */
export function AuthFooter() {
  return (
    <div className="mt-12 flex items-center justify-between text-[10px] text-muted-foreground/80 lg:mt-14">
      <span className="font-mono tracking-[0.14em] uppercase">
        © {new Date().getFullYear()} TryNotifly
      </span>
      <div className="flex items-center gap-2">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
          <span className="relative inline-flex size-1.5 rounded-full bg-primary shadow-[0_0_6px_color-mix(in_oklch,var(--primary)_60%,transparent)]" />
        </span>
        <span className="font-mono tracking-[0.14em] uppercase">
          All systems operational
        </span>
      </div>
    </div>
  );
}

/**
 * AuthDivider — the "or with email" tagline between OAuth and credential entry.
 */
export function AuthDivider({ label = "or with email" }: { label?: string }) {
  return (
    <div className="my-7 flex items-center gap-3">
      <div className="h-px flex-1 bg-linear-to-r from-transparent to-border/60" />
      <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground/70 uppercase">
        {label}
      </span>
      <div className="h-px flex-1 bg-linear-to-l from-transparent to-border/60" />
    </div>
  );
}

/**
 * TopRightLink — desktop sign-in/up cross-link sitting above the form.
 */
export function TopRightLink({
  prompt,
  href,
  cta,
}: {
  prompt: string;
  href: string;
  cta: string;
}) {
  return (
    <>
      <span className="text-xs text-muted-foreground/85">{prompt}</span>
      <Link
        href={href}
        className="group inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-foreground transition-colors hover:text-primary"
      >
        {cta}
        <ArrowRight
          className="size-3 transition-transform duration-200 group-hover:translate-x-0.5"
          strokeWidth={2.25}
        />
      </Link>
    </>
  );
}

/**
 * MobileTopRightLink — compact cross-link in the mobile header.
 */
export function MobileTopRightLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:text-foreground"
    >
      {label} →
    </Link>
  );
}
