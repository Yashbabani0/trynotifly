import {
  DatabaseZap,
  KeyRound,
  LockKeyhole,
  ServerCog,
  ShieldAlert,
  UsersRound,
} from "lucide-react";

const features = [
  {
    title: "Hashed API keys",
    description:
      "API keys are shown once and stored as secure hashes. Raw keys are never saved after creation.",
    icon: KeyRound,
  },
  {
    title: "Workspace access control",
    description:
      "Organization and workspace roles help limit access to billing, domains, API keys, and members.",
    icon: UsersRound,
  },
  {
    title: "Domain verification",
    description:
      "Email sending domains require DNS verification before they can be used for production delivery.",
    icon: LockKeyhole,
  },
  {
    title: "Abuse protection",
    description:
      "Rate limits, plan limits, channel limits, and credit checks help prevent misuse of the platform.",
    icon: ShieldAlert,
  },
  {
    title: "Secure infrastructure",
    description:
      "Production systems are separated from test environments, with careful handling of secrets and provider keys.",
    icon: ServerCog,
  },
  {
    title: "Event logging",
    description:
      "Notification events, delivery attempts, and important account actions can be logged for visibility.",
    icon: DatabaseZap,
  },
];

export function SecurityFeatures() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">
            Security controls
          </h2>
          <p className="mt-4 text-muted-foreground">
            Core protections that help keep accounts, projects, and notification
            channels safe.
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
