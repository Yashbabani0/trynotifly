// components/home/channels.tsx

import Link from "next/link";
import {
  ArrowRight,
  Mail,
  MessageSquareText,
  Smartphone,
  Bell,
} from "lucide-react";

const channels = [
  {
    title: "Email",
    label: "Transactional • Alerts",
    description:
      "Send OTPs, invoices, account updates, alerts, and lifecycle emails with reliable delivery.",
    href: "/email",
    icon: Mail,
  },
  {
    title: "SMS",
    label: "OTP • Critical updates",
    description:
      "Deliver time-sensitive verification codes, payment alerts, and important customer updates.",
    href: "/sms",
    icon: MessageSquareText,
  },
  {
    title: "WhatsApp",
    label: "Templates • Utility",
    description:
      "Reach customers with approved WhatsApp templates, order updates, reminders, and alerts.",
    href: "/whatsapp",
    icon: Smartphone,
  },
  {
    title: "Push",
    label: "Web • Mobile",
    description:
      "Send browser and app push notifications for engagement, reminders, alerts, and activity updates.",
    href: "/push-notifications",
    icon: Bell,
  },
];

const platformStats = [
  {
    value: "1 API",
    label: "Unified integration",
  },
  {
    value: "4 Channels",
    label: "Email, SMS, WhatsApp, Push",
  },
  {
    value: "1 Dashboard",
    label: "Centralized management",
  },
  {
    value: "1 Analytics",
    label: "Delivery insights",
  },
];

export function Channels() {
  return (
    <section className="border-t bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-primary">
            One platform. Every channel.
          </p>

          <h2 className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Reach users wherever they are
          </h2>

          <p className="mt-5 text-balance text-lg text-muted-foreground">
            Manage Email, SMS, WhatsApp and Push notifications from one
            developer-first platform.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((channel) => {
            const Icon = channel.icon;

            return (
              <Link
                key={channel.href}
                href={channel.href}
                className="group rounded-3xl border bg-card p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </div>

                <div className="mt-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {channel.label}
                  </p>

                  <h3 className="mt-2 text-xl font-semibold tracking-tight">
                    {channel.title}
                  </h3>
                </div>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {channel.description}
                </p>

                <div className="mt-6 flex items-center text-sm font-medium text-primary">
                  Learn more
                  <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 rounded-3xl border bg-muted/20 p-6 sm:p-8">
          <div className="grid gap-6 text-center sm:grid-cols-2 lg:grid-cols-4">
            {platformStats.map((stat) => (
              <div key={stat.value} className="rounded-2xl px-4 py-3">
                <p className="text-2xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
