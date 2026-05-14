import type { ReactNode } from "react";
import { Activity, Bell, ShieldCheck, Zap } from "lucide-react";

import { BrandMark } from "./shell";

/**
 * AuthLeftPanel — the branded visual half of the split screen.
 * Layout, backgrounds and feature list stay constant across every auth page.
 * Pages provide: tag chip text, headline, description, and a support card.
 */
export function AuthLeftPanel({
  tag,
  headline,
  description,
  supportCard,
}: {
  tag: string;
  headline: ReactNode;
  description: ReactNode;
  supportCard: ReactNode;
}) {
  return (
    <aside className="relative hidden overflow-hidden border-r border-border/60 lg:flex lg:flex-col">
      {/* Base wash — subtle vertical depth */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklch, var(--foreground) 2%, transparent) 0%, transparent 50%, color-mix(in oklch, var(--background) 100%, black 4%) 100%)",
        }}
      />
      {/* Soft grid — lower contrast, tighter mask */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 55% at 35% 38%, black 30%, transparent 75%)",
        }}
      />
      {/* Localized primary glow — top left */}
      <div
        aria-hidden
        className="absolute -top-24 -left-24 size-80 rounded-full opacity-[0.18] blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklch, var(--primary) 60%, transparent), transparent)",
        }}
      />
      {/* Faint counter glow — bottom right */}
      <div
        aria-hidden
        className="absolute -right-48 -bottom-48 size-88 rounded-full opacity-[0.07] blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklch, var(--primary) 50%, transparent), transparent)",
        }}
      />
      {/* Hairlines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, color-mix(in oklch, var(--primary) 35%, transparent) 50%, transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-px"
        style={{
          background:
            "linear-gradient(to bottom, transparent, color-mix(in oklch, var(--foreground) 8%, transparent) 30%, color-mix(in oklch, var(--foreground) 8%, transparent) 70%, transparent)",
        }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between p-12 xl:p-16">
        <BrandMark size="md" />

        <div className="max-w-md space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-2.5 py-1 backdrop-blur-sm">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
              <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
              {tag}
            </span>
          </div>

          <h1 className="max-w-[20ch] text-[2.5rem] leading-[1.02] font-medium tracking-[-0.02em] text-foreground xl:text-[2.85rem]">
            {headline}
          </h1>

          <p className="max-w-[34ch] text-[13px] leading-[1.65] text-muted-foreground">
            {description}
          </p>

          <div className="mt-7 max-w-104">{supportCard}</div>
        </div>

        <FeatureList />
      </div>
    </aside>
  );
}

/**
 * Highlight — the underlined primary-color span used inside left-panel headlines.
 */
export function Highlight({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block text-primary">
      {children}
      <span
        aria-hidden
        className="absolute inset-x-0 -bottom-1 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent"
      />
    </span>
  );
}

function FeatureList() {
  return (
    <ul className="grid max-w-md grid-cols-2 gap-x-8 gap-y-5 text-xs">
      <FeatureItem
        icon={<Zap className="size-3.5" strokeWidth={2} />}
        title="p95 < 120ms"
        subtitle="Globally distributed"
      />
      <FeatureItem
        icon={<ShieldCheck className="size-3.5" strokeWidth={2} />}
        title="SOC 2 Type II"
        subtitle="Encrypted in transit & rest"
      />
      <FeatureItem
        icon={<Activity className="size-3.5" strokeWidth={2} />}
        title="Realtime logs"
        subtitle="Per-event traces"
      />
      <FeatureItem
        icon={<Bell className="size-3.5" strokeWidth={2} />}
        title="Smart routing"
        subtitle="Fallback channels"
      />
    </ul>
  );
}

function FeatureItem({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <li className="group flex items-start gap-2.5">
      <span
        className="mt-px flex size-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-card/40 text-primary transition-colors duration-200 group-hover:border-border group-hover:bg-card/60"
        style={{
          boxShadow:
            "inset 0 1px 0 0 color-mix(in oklch, var(--foreground) 4%, transparent)",
        }}
      >
        {icon}
      </span>
      <div className="space-y-0.5 leading-tight">
        <p className="text-[12px] font-medium tracking-tight text-foreground">
          {title}
        </p>
        <p className="text-[11px] text-muted-foreground/85">{subtitle}</p>
      </div>
    </li>
  );
}
