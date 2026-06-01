import {
  Activity,
  Braces,
  FileText,
  KeyRound,
  Mail,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    title: "Simple Email API",
    description:
      "Send transactional emails from your app using a clean API and developer-friendly request structure.",
    icon: Braces,
  },
  {
    title: "Verified sending domains",
    description:
      "Use your own domain with DNS verification for better trust, branding, and deliverability.",
    icon: ShieldCheck,
  },
  {
    title: "Template-based sending",
    description:
      "Create reusable templates for OTPs, invoices, password resets, and lifecycle emails.",
    icon: FileText,
  },
  {
    title: "API key protection",
    description:
      "Use separate test and live keys to keep development and production traffic isolated.",
    icon: KeyRound,
  },
  {
    title: "Delivery visibility",
    description:
      "Track sent, failed, bounced, and delivered events from your dashboard.",
    icon: Activity,
  },
  {
    title: "Multi-channel ready",
    description:
      "Start with Email and expand to SMS, WhatsApp, and Push notifications when needed.",
    icon: Mail,
  },
];

export function EmailFeatures() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">
            Everything you need to send reliable emails
          </h2>
          <p className="mt-4 text-muted-foreground">
            Built for product teams, SaaS apps, marketplaces, internal tools,
            and ecommerce platforms.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-3xl border bg-card p-6 shadow-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>

                <h3 className="text-lg font-semibold">{feature.title}</h3>
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
