// components/home/security.tsx

import {
  ShieldCheck,
  Server,
  Lock,
  Activity,
  CheckCircle2,
  Globe,
} from "lucide-react";

const items = [
  {
    title: "Secure by default",
    description:
      "API keys, authentication, and infrastructure designed with security in mind.",
    icon: Lock,
  },
  {
    title: "Delivery monitoring",
    description: "Track delivery, failures, and webhook events in real time.",
    icon: Activity,
  },
  {
    title: "Verified sending domains",
    description: "Support for SPF, DKIM and domain verification workflows.",
    icon: Globe,
  },
  {
    title: "Reliable infrastructure",
    description: "Built with redundant providers and monitoring systems.",
    icon: Server,
  },
];

export function Security() {
  return (
    <section className="border-t py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-medium text-primary">
              Security & reliability
            </p>

            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Built for production workloads
            </h2>

            <p className="mt-5 text-lg text-muted-foreground">
              Whether you're sending OTPs, invoices, order updates or customer
              alerts, reliability and security are built into every layer of the
              platform.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Domain verification support",
                "Webhook event tracking",
                "Team access controls",
                "Delivery analytics",
                "Provider monitoring",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-3xl border bg-card p-8"
                >
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold">{item.title}</h3>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 rounded-3xl border bg-muted/20 p-8">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              Secure Infrastructure
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              Real-time Monitoring
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              Domain Verification
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              Delivery Analytics
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
