import { Bell, Mail, MessageSquareText, Smartphone } from "lucide-react";

const channels = [
  {
    title: "Email",
    description: "Transactional emails for invoices, OTPs and account updates.",
    points: ["Transactional emails", "Invoices", "Account updates", "Alerts"],
    icon: Mail,
  },
  {
    title: "SMS",
    description:
      "Time-sensitive messages for verification and critical alerts.",
    points: [
      "OTP messages",
      "Verification",
      "Payment alerts",
      "Critical updates",
    ],
    icon: MessageSquareText,
  },
  {
    title: "WhatsApp",
    description: "Template-based WhatsApp messages for customer communication.",
    points: ["Utility templates", "Order updates", "Reminders", "Alerts"],
    icon: Smartphone,
  },
  {
    title: "Push",
    description: "Web and mobile push notifications for engagement.",
    points: ["Web push", "Mobile push", "Reminders", "Engagement alerts"],
    icon: Bell,
  },
];

export function ChannelFeatures() {
  return (
    <section className="border-t py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-sm font-medium text-primary">Channels</p>

            <h2 className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Reach customers on every important channel
            </h2>

            <p className="mt-5 text-lg text-muted-foreground">
              Use one platform for transactional Email, SMS, WhatsApp and Push
              notifications without managing multiple vendor dashboards.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {channels.map((channel) => {
              const Icon = channel.icon;

              return (
                <div
                  key={channel.title}
                  className="rounded-3xl border bg-card p-7 shadow-sm"
                >
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold">
                    {channel.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {channel.description}
                  </p>

                  <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                    {channel.points.map((point) => (
                      <li key={point}>
                        <span className="text-primary">✓</span> {point}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
