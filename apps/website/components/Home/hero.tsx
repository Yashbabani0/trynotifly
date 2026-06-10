"use client";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  MessageSquareText,
  Smartphone,
  BellRing,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const URLS = {
  dashboard: process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3000",
  docs: process.env.NEXT_PUBLIC_DOCS_URL ?? "http://localhost:3002",
};

const SIGN_UP_URL = `${URLS.dashboard}/sign-up`;

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-black pt-36 text-white sm:pt-44">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[64px_64px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(132,255,204,0.18),transparent_35%),linear-gradient(to_bottom,transparent,black_85%)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 backdrop-blur">
              <BellRing className="size-4 text-emerald-300" />
              Multi-channel notification infrastructure
            </div>

            <h1 className="mt-8 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Send every customer notification from one API.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              TryNotifly helps you send Email, SMS, WhatsApp, and Push
              notifications with delivery tracking, logs, analytics, and
              developer-friendly APIs.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-white px-7 text-black hover:bg-white/90"
              >
                <Link href={SIGN_UP_URL}>
                  Start free
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/15 bg-white/5 px-7 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href={URLS.docs}>View docs</Link>
              </Button>
            </div>

            <div className="mt-8 grid gap-3 text-sm text-white/60 sm:grid-cols-3">
              {["Email + SMS", "WhatsApp API", "Push notifications"].map(
                (item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-300" />
                    {item}
                  </div>
                ),
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="relative"
          >
            <div className="rounded-3xl border border-white/10 bg-white/4 p-4 shadow-2xl shadow-emerald-500/10 backdrop-blur">
              <div className="rounded-2xl border border-white/10 bg-black/70 p-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm text-white/50">Live delivery</p>
                    <h3 className="mt-1 text-lg font-medium">
                      Notification dashboard
                    </h3>
                  </div>

                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                    Operational
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
                  {[
                    {
                      icon: Mail,
                      label: "Email",
                      value: "98.7%",
                      text: "Delivered",
                    },
                    {
                      icon: MessageSquareText,
                      label: "SMS",
                      value: "96.2%",
                      text: "Delivered",
                    },
                    {
                      icon: Smartphone,
                      label: "WhatsApp",
                      value: "99.1%",
                      text: "Delivered",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-white/10">
                          <item.icon className="size-5 text-emerald-300" />
                        </div>
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-xs text-white/45">{item.text}</p>
                        </div>
                      </div>

                      <p className="text-xl font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm text-white/60">
                    <Activity className="size-4 text-emerald-300" />
                    API usage this month
                  </div>

                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-2 w-[72%] rounded-full bg-emerald-300" />
                  </div>

                  <div className="mt-3 flex justify-between text-xs text-white/45">
                    <span>72,400 sent</span>
                    <span>100,000 limit</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-6 -top-12 hidden rounded-2xl border border-white/10 bg-black/80 p-4 shadow-xl backdrop-blur md:block">
              <p className="text-xs text-white/50">Avg. latency</p>
              <p className="mt-1 text-2xl font-semibold">82ms</p>
            </div>
          </motion.div>
        </div>

        <div className="mt-20 grid border-t border-white/10 py-8 text-center sm:grid-cols-3">
          {[
            ["99.9%", "API uptime target"],
            ["4", "notification channels"],
            ["Realtime", "logs and delivery tracking"],
          ].map(([value, label]) => (
            <div key={label} className="py-6">
              <p className="text-3xl font-semibold">{value}</p>
              <p className="mt-2 text-sm text-white/50">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
