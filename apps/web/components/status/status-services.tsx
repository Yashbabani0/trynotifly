import {
  Bell,
  CheckCircle2,
  Globe2,
  LayoutDashboard,
  Mail,
  MessageCircle,
  MessageSquareText,
  Server,
} from "lucide-react";

const services = [
  {
    name: "Dashboard",
    description:
      "User dashboard, organizations, workspaces, billing, and API keys.",
    status: "Operational",
    icon: LayoutDashboard,
  },
  {
    name: "API",
    description:
      "Core notification APIs, authentication, and request handling.",
    status: "Operational",
    icon: Server,
  },
  {
    name: "Website",
    description: "Marketing website, pricing, documentation, and public pages.",
    status: "Operational",
    icon: Globe2,
  },
  {
    name: "Email",
    description:
      "Transactional email sending, templates, domains, and delivery logs.",
    status: "Operational",
    icon: Mail,
  },
  {
    name: "SMS",
    description:
      "OTP, alerts, transactional SMS, and delivery status tracking.",
    status: "Operational",
    icon: MessageSquareText,
  },
  {
    name: "WhatsApp",
    description:
      "WhatsApp Business templates, utility messages, and delivery events.",
    status: "Operational",
    icon: MessageCircle,
  },
  {
    name: "Push Notifications",
    description:
      "Web push, mobile push, reminders, and engagement notifications.",
    status: "Operational",
    icon: Bell,
  },
];

export function StatusServices() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">
            Service status
          </h2>

          <p className="mt-4 text-muted-foreground">
            Current status for public website, dashboard, APIs, and notification
            delivery channels.
          </p>
        </div>

        <div className="mt-12 grid gap-6">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.name}
                className="rounded-3xl border bg-card p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>

                    <div>
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {service.status}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
