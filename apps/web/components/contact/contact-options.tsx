import {
  AlertTriangle,
  CreditCard,
  Handshake,
  Headphones,
  Mail,
  MessageSquare,
} from "lucide-react";

const options = [
  {
    title: "Sales",
    description: "Talk to us about pricing, plans and enterprise requirements.",
    icon: MessageSquare,
  },
  {
    title: "Support",
    description:
      "Get help with setup, dashboard usage and notification issues.",
    icon: Headphones,
  },
  {
    title: "Billing",
    description:
      "Questions about payments, invoices, refunds and subscriptions.",
    icon: CreditCard,
  },
  {
    title: "Abuse reports",
    description: "Report spam, phishing, misuse or suspicious activity.",
    icon: AlertTriangle,
  },
  {
    title: "Partnerships",
    description:
      "Discuss integrations, collaborations and business partnerships.",
    icon: Handshake,
  },
  {
    title: "General",
    description: "For anything else related to TryNotifly.",
    icon: Mail,
  },
];

export function ContactOptions() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {options.map((option) => {
            const Icon = option.icon;

            return (
              <div
                key={option.title}
                className="rounded-3xl border bg-card p-8 shadow-sm"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </div>

                <h2 className="mt-6 text-xl font-semibold tracking-tight">
                  {option.title}
                </h2>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {option.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
