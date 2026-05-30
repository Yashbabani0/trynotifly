import {
  BarChart3,
  FileText,
  Globe,
  KeyRound,
  Radio,
  Webhook,
} from "lucide-react";

const features = [
  {
    title: "Unified API",
    description:
      "Send Email, SMS, WhatsApp and Push notifications from a single integration.",
    icon: Radio,
  },
  {
    title: "Templates",
    description:
      "Manage reusable templates for transactional messages, alerts and updates.",
    icon: FileText,
  },
  {
    title: "Analytics",
    description:
      "Track delivery, failures, usage and engagement across every channel.",
    icon: BarChart3,
  },
  {
    title: "Webhooks",
    description:
      "Receive real-time delivery events and notification updates in your app.",
    icon: Webhook,
  },
  {
    title: "API Keys",
    description:
      "Create test and live API keys for secure production and sandbox usage.",
    icon: KeyRound,
  },
  {
    title: "Custom Domains",
    description:
      "Verify sending domains with SPF, DKIM and DMARC-ready workflows.",
    icon: Globe,
  },
];

export function CoreFeatures() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-primary">Core platform</p>

          <h2 className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Built for modern product teams
          </h2>

          <p className="mt-5 text-balance text-lg text-muted-foreground">
            Everything your team needs to create, send and monitor customer
            notifications at scale.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-3xl border bg-card p-8 shadow-sm"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </div>

                <h3 className="mt-6 text-xl font-semibold tracking-tight">
                  {feature.title}
                </h3>

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
