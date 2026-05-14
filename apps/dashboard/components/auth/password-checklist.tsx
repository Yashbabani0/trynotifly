"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { useMemo } from "react";

import { cn } from "@/lib/utils";

type Rule = {
  id: string;
  label: string;
  test: (value: string) => boolean;
};

/**
 * Rules mirror the server-side `passwordSchema` exactly so users never see
 * a passing checklist that then fails validation.
 */
const RULES: Rule[] = [
  { id: "length", label: "8+ characters", test: (v) => v.length >= 8 },
  { id: "upper", label: "Uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { id: "lower", label: "Lowercase letter", test: (v) => /[a-z]/.test(v) },
  { id: "number", label: "Number", test: (v) => /[0-9]/.test(v) },
  {
    id: "special",
    label: "Special character",
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
];

export function getPasswordRuleStates(value: string) {
  return RULES.map((r) => ({ id: r.id, label: r.label, met: r.test(value) }));
}

const EASE = [0.22, 1, 0.36, 1] as const;

export function PasswordChecklist({
  value,
  className,
  visible = true,
}: {
  value: string;
  className?: string;
  visible?: boolean;
}) {
  const states = useMemo(() => getPasswordRuleStates(value), [value]);
  const metCount = states.filter((s) => s.met).length;
  const total = states.length;
  const progress = (metCount / total) * 100;

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          key="checklist"
          initial={{ opacity: 0, height: 0, y: -4 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: -4 }}
          transition={{ duration: 0.3, ease: EASE }}
          className={cn("overflow-hidden", className)}
          style={{ willChange: "height, opacity, transform" }}
        >
          <div className="mt-2.5 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="relative h-0.75 flex-1 overflow-hidden rounded-full bg-foreground/6">
                <motion.div
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background:
                      metCount === total
                        ? "var(--primary)"
                        : metCount >= 3
                          ? "color-mix(in oklch, var(--primary) 80%, transparent)"
                          : "color-mix(in oklch, var(--foreground) 30%, transparent)",
                    transition: "background 0.3s ease",
                  }}
                />
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={metCount === total ? "strong" : "weak"}
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 2 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "shrink-0 font-mono text-[10px] tabular-nums tracking-[0.12em] uppercase",
                    metCount === total
                      ? "text-primary"
                      : metCount >= 3
                        ? "text-foreground/70"
                        : "text-muted-foreground/70",
                  )}
                >
                  {metCount}/{total}
                </motion.span>
              </AnimatePresence>
            </div>

            <ul className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
              {states.map((rule) => (
                <li
                  key={rule.id}
                  className="flex items-center gap-2 text-[11.5px] leading-none"
                >
                  <motion.span
                    initial={false}
                    animate={{
                      backgroundColor: rule.met
                        ? "color-mix(in oklch, var(--primary) 18%, transparent)"
                        : "color-mix(in oklch, var(--foreground) 4%, transparent)",
                      borderColor: rule.met
                        ? "color-mix(in oklch, var(--primary) 55%, transparent)"
                        : "color-mix(in oklch, var(--border) 100%, transparent)",
                      scale: rule.met ? 1 : 0.94,
                    }}
                    transition={{ duration: 0.24, ease: EASE }}
                    className="relative flex size-3.5 shrink-0 items-center justify-center rounded-full border"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {rule.met ? (
                        <motion.span
                          key="met"
                          initial={{ scale: 0, rotate: -90, opacity: 0 }}
                          animate={{ scale: 1, rotate: 0, opacity: 1 }}
                          exit={{ scale: 0, rotate: 90, opacity: 0 }}
                          transition={{ duration: 0.22, ease: EASE }}
                          className="flex items-center justify-center"
                        >
                          <Check
                            className="size-2.5 text-primary"
                            strokeWidth={3.5}
                          />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="unmet"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.18, ease: EASE }}
                          className="size-1 rounded-full bg-muted-foreground/40"
                        />
                      )}
                    </AnimatePresence>
                  </motion.span>

                  <motion.span
                    initial={false}
                    animate={{
                      color: rule.met
                        ? "color-mix(in oklch, var(--foreground) 92%, transparent)"
                        : "color-mix(in oklch, var(--muted-foreground) 90%, transparent)",
                    }}
                    transition={{ duration: 0.22 }}
                    className="font-medium tracking-tight"
                  >
                    {rule.label}
                  </motion.span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
