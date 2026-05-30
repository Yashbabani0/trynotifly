// components/home/features.tsx

import {
  BarChart3,
  KeyRound,
  Webhook,
  FileText,
  Users,
  Globe,
} from "lucide-react";

const features = [
  {
    title: "Analytics",
    description:
      "Track delivery, opens, clicks, failures and engagement across all channels.",
    icon: BarChart3,
  },
  {
    title: "API Keys",
    description:
      "Create test and live API keys with secure authentication and usage tracking.",
    icon: KeyRound,
  },
  {
    title: "Webhooks",
    description:
      "Receive delivery events, failures and notification updates in real time.",
    icon: Webhook,
  },
  {
    title: "Templates",
    description:
      "Manage reusable Email, SMS and WhatsApp templates from one dashboard.",
    icon: FileText,
  },
  {
    title: "Team Management",
    description: "Invite teammates, manage roles and collaborate securely.",
    icon: Users,
  },
  {
    title: "Domain Verification",
    description: "Verify sending domains with SPF, DKIM and DMARC support.",
    icon: Globe,
  },
];

export function Features() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-primary">
            Built for developers
          </p>

          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Everything you need to deliver notifications
          </h2>

          <p className="mt-5 text-lg text-muted-foreground">
            Powerful tools to build, send, monitor and scale customer
            notifications across every channel.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-3xl border bg-card p-8"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </div>

                <h3 className="mt-6 text-xl font-semibold">{feature.title}</h3>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
