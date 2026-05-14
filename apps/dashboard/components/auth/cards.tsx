"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Inbox, KeyRound, Mail, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * SupportCardShell — the chrome of every left-panel support card.
 * Provides the terminal-like header (traffic dots + label + live indicator)
 * and the framed body with consistent depth shadows.
 */
function SupportCardShell({
  title,
  rightLabel = "─ live",
  children,
}: {
  title: string;
  rightLabel?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-lg border border-border/60 bg-card/50 backdrop-blur-sm"
      style={{
        boxShadow:
          "0 1px 0 0 color-mix(in oklch, var(--foreground) 4%, transparent) inset, 0 10px 30px -12px color-mix(in oklch, black 60%, transparent), 0 1px 2px 0 color-mix(in oklch, black 30%, transparent)",
      }}
    >
      <div className="flex items-center justify-between border-b border-border/50 bg-card/30 px-3.5 py-2">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-destructive/50" />
          <span className="size-2 rounded-full bg-muted-foreground/30" />
          <span className="size-2 rounded-full bg-primary/60" />
        </div>
        <span className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground/80 uppercase">
          {title}
        </span>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
          {rightLabel}
        </span>
      </div>
      {children}
    </div>
  );
}

/* ─── EVENT LOG (sign-up) ────────────────────────────────────────────── */

export function EventLogCard() {
  return (
    <SupportCardShell title="events.log">
      <div className="divide-y divide-border/30 font-mono text-[11px] leading-snug">
        <LogLine
          delay={0.05}
          ts="14:02:18"
          badge="200"
          badgeTone="primary"
          channel="email"
          text="delivered → acme.com"
        />
        <LogLine
          delay={0.16}
          ts="14:02:19"
          badge="202"
          badgeTone="primary"
          channel="sms"
          text="queued → +1•••0231"
        />
        <LogLine
          delay={0.27}
          ts="14:02:21"
          badge="—"
          badgeTone="muted"
          channel="push"
          text="scheduled → 12.4k devices"
        />
        <LogLine
          delay={0.38}
          ts="14:02:24"
          badge="200"
          badgeTone="primary"
          channel="hook"
          text="ack 38ms"
        />
      </div>
    </SupportCardShell>
  );
}

function LogLine({
  delay,
  ts,
  badge,
  badgeTone,
  channel,
  text,
}: {
  delay: number;
  ts: string;
  badge: string;
  badgeTone: "primary" | "muted";
  channel: string;
  text: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: EASE }}
      className="flex items-center gap-2.5 px-3.5 py-1.5 text-muted-foreground"
    >
      <span className="shrink-0 tabular-nums text-muted-foreground/55">
        {ts}
      </span>
      <Pill tone={badgeTone}>{badge}</Pill>
      <span className="shrink-0 text-foreground/55">{channel}</span>
      <span className="truncate text-foreground/75">{text}</span>
    </motion.div>
  );
}

/* ─── SESSION STATS (sign-in) ───────────────────────────────────────── */

export function SessionStatsCard() {
  return (
    <SupportCardShell title="session.resume">
      <div className="divide-y divide-border/30 font-mono text-[11px] leading-snug">
        <StatRow
          delay={0.05}
          label="Events / 24h"
          value="1.84M"
          delta="+12.4%"
          deltaTone="primary"
        />
        <StatRow
          delay={0.16}
          label="Delivery rate"
          value="99.98%"
          delta="stable"
          deltaTone="muted"
        />
        <StatRow
          delay={0.27}
          label="p95 latency"
          value="108ms"
          delta="-6ms"
          deltaTone="primary"
        />
        <StatRow
          delay={0.38}
          label="Active channels"
          value="4 / 4"
          delta="ok"
          deltaTone="primary"
        />
      </div>
    </SupportCardShell>
  );
}

function StatRow({
  delay,
  label,
  value,
  delta,
  deltaTone,
}: {
  delay: number;
  label: string;
  value: string;
  delta: string;
  deltaTone: "primary" | "muted";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: EASE }}
      className="flex items-center justify-between px-3.5 py-2"
    >
      <span className="text-muted-foreground/75">{label}</span>
      <div className="flex items-center gap-2.5">
        <span className="tabular-nums text-foreground/85">{value}</span>
        <Pill tone={deltaTone} minWidth="2.4rem">
          {delta}
        </Pill>
      </div>
    </motion.div>
  );
}

/* ─── RECOVERY STEPS (forgot-password) ──────────────────────────────── */

export function RecoveryStepsCard() {
  return (
    <SupportCardShell title="recovery.flow" rightLabel="3 steps">
      <ol className="divide-y divide-border/30 font-mono text-[11px] leading-snug">
        <StepRow
          delay={0.05}
          index="01"
          title="Submit your email"
          subtitle="We check it against our records"
          icon={<Mail className="size-3" strokeWidth={2} />}
        />
        <StepRow
          delay={0.16}
          index="02"
          title="Check your inbox"
          subtitle="A signed reset link · valid for 30 min"
          icon={<Inbox className="size-3" strokeWidth={2} />}
        />
        <StepRow
          delay={0.27}
          index="03"
          title="Set a new password"
          subtitle="You're back in within seconds"
          icon={<KeyRound className="size-3" strokeWidth={2} />}
        />
      </ol>
    </SupportCardShell>
  );
}

function StepRow({
  delay,
  index,
  title,
  subtitle,
  icon,
}: {
  delay: number;
  index: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: EASE }}
      className="flex items-start gap-3 px-3.5 py-2.5"
    >
      <span className="font-mono text-[10px] tabular-nums tracking-[0.14em] text-muted-foreground/55">
        {index}
      </span>
      <span
        className="mt-px flex size-5 shrink-0 items-center justify-center rounded-sm border border-border/60 bg-card/40 text-primary"
        style={{
          boxShadow:
            "inset 0 1px 0 0 color-mix(in oklch, var(--foreground) 4%, transparent)",
        }}
      >
        {icon}
      </span>
      <div className="flex-1 space-y-0.5 leading-snug">
        <p className="font-sans text-[11.5px] font-medium tracking-tight text-foreground/90">
          {title}
        </p>
        <p className="font-sans text-[10.5px] text-muted-foreground/80">
          {subtitle}
        </p>
      </div>
    </motion.li>
  );
}

/* ─── SECURITY TIPS (reset-password) ────────────────────────────────── */

export function SecurityCard() {
  const items: { label: string; value: string }[] = [
    { label: "Algorithm", value: "argon2id" },
    { label: "Rotation", value: "never reused" },
    { label: "Audit log", value: "recorded" },
    { label: "Sessions", value: "revoked on change" },
  ];
  return (
    <SupportCardShell title="security.posture" rightLabel="hardened">
      <div className="px-3.5 py-3">
        <div className="mb-2.5 flex items-center gap-2">
          <span
            className="flex size-5 items-center justify-center rounded-sm border border-border/60 bg-card/40 text-primary"
            style={{
              boxShadow:
                "inset 0 1px 0 0 color-mix(in oklch, var(--foreground) 4%, transparent)",
            }}
          >
            <ShieldCheck className="size-3" strokeWidth={2} />
          </span>
          <span className="font-mono text-[10px] tracking-[0.14em] text-foreground/80 uppercase">
            Resetting credentials
          </span>
        </div>
        <ul className="divide-y divide-border/30 font-mono text-[11px] leading-snug">
          {items.map((it, i) => (
            <motion.li
              key={it.label}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.08, duration: 0.4, ease: EASE }}
              className="flex items-center justify-between py-1.5"
            >
              <span className="text-muted-foreground/75">{it.label}</span>
              <span className="tabular-nums text-foreground/80">
                {it.value}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </SupportCardShell>
  );
}

/* ─── VERIFY STATUS (verify-email) ──────────────────────────────────── */

export function VerifyStatusCard({ email }: { email: string | null }) {
  return (
    <SupportCardShell title="verify.poll" rightLabel="auto-detect">
      <div className="px-3.5 py-3 font-mono text-[11px] leading-snug">
        <motion.div
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="flex items-center justify-between py-1.5"
        >
          <span className="text-muted-foreground/75">recipient</span>
          <span className="max-w-[60%] truncate text-foreground/85">
            {email ?? "—"}
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4, ease: EASE }}
          className="flex items-center justify-between py-1.5"
        >
          <span className="text-muted-foreground/75">checking interval</span>
          <span className="tabular-nums text-foreground/85">3000 ms</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.4, ease: EASE }}
          className="flex items-center justify-between py-1.5"
        >
          <span className="text-muted-foreground/75">link expires</span>
          <span className="tabular-nums text-foreground/85">in 24h</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.4, ease: EASE }}
          className="mt-2 flex items-center justify-between border-t border-border/30 pt-2"
        >
          <span className="text-muted-foreground/75">status</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
              <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
            </span>
            <span className="text-primary/95">awaiting confirmation</span>
          </span>
        </motion.div>
      </div>
    </SupportCardShell>
  );
}

/* ─── primitives ────────────────────────────────────────────────────── */

function Pill({
  tone,
  minWidth = "2.1rem",
  children,
}: {
  tone: "primary" | "muted";
  minWidth?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-4.5 shrink-0 items-center justify-center rounded-[3px] border px-1 text-[9px] tracking-[0.08em] tabular-nums",
        tone === "primary"
          ? "border-primary/30 bg-primary/8 text-primary"
          : "border-border/60 bg-card/40 text-muted-foreground/70",
      )}
      style={{ minWidth }}
    >
      {children}
    </span>
  );
}

/* ─── animated icons for verify-email body ──────────────────────────── */

export function PulsingMailIcon() {
  return (
    <div className="relative">
      <motion.div
        initial={{ scale: 0.92, opacity: 0.6 }}
        animate={{ scale: 1.05, opacity: 0 }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeOut",
        }}
        className="absolute inset-0 rounded-md border border-primary/40"
      />
      <div
        className="flex size-10 items-center justify-center rounded-md border border-border/70 bg-card/50 text-primary"
        style={{
          boxShadow:
            "inset 0 1px 0 0 color-mix(in oklch, var(--foreground) 5%, transparent), inset 0 0 0 1px color-mix(in oklch, var(--primary) 18%, transparent)",
        }}
      >
        <Mail className="size-4" strokeWidth={2} />
      </div>
    </div>
  );
}

