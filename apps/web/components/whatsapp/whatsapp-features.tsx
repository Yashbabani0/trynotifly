import {
  Activity,
  BadgeCheck,
  FileText,
  MessageCircle,
  MessagesSquare,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    title: "WhatsApp API",
    description:
      "Trigger WhatsApp notifications from your application using a clean API.",
    icon: MessageCircle,
  },
  {
    title: "Template messages",
    description:
      "Send approved templates for OTPs, order updates, payment alerts, and reminders.",
    icon: FileText,
  },
  {
    title: "Authentication messages",
    description:
      "Deliver OTPs, login verification, and account recovery messages on WhatsApp.",
    icon: ShieldCheck,
  },
  {
    title: "Utility notifications",
    description:
      "Send order, billing, shipping, appointment, and account-related updates.",
    icon: MessagesSquare,
  },
  {
    title: "Delivery tracking",
    description:
      "Track queued, sent, delivered, read, failed, and rejected WhatsApp messages.",
    icon: Activity,
  },
  {
    title: "Business verification",
    description:
      "Support workflows around Meta Business verification, display names, and phone numbers.",
    icon: BadgeCheck,
  },
];

export function WhatsappFeatures() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">
            WhatsApp notifications for modern customer journeys
          </h2>
          <p className="mt-4 text-muted-foreground">
            Built for OTPs, transactional updates, reminders, service messages,
            and business-critical customer communication.
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
