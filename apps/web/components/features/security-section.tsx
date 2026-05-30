import {
  CheckCircle2,
  KeyRound,
  Lock,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const items = [
  {
    title: "API key security",
    description: "Use separate test and live keys for safer integrations.",
    icon: KeyRound,
  },
  {
    title: "Role-based access",
    description: "Invite team members and control what they can manage.",
    icon: Lock,
  },
  {
    title: "Domain verification",
    description: "Verify sending domains with DNS-based authentication.",
    icon: ShieldCheck,
  },
  {
    title: "Event tracking",
    description: "Track delivery, failures and webhook events in real time.",
    icon: Workflow,
  },
];

export function SecuritySection() {
  return (
    <section className="border-t py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-medium text-primary">
              Security & reliability
            </p>

            <h2 className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Designed for production notification systems
            </h2>

            <p className="mt-5 text-lg text-muted-foreground">
              Secure API keys, verified domains, team access controls and
              delivery monitoring help you run notification workflows with
              confidence.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Test and live API keys",
                "Verified sending domains",
                "Team access controls",
                "Delivery monitoring",
              ].map((point) => (
                <div key={point} className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-primary" />
                  <span>{point}</span>
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
                  className="rounded-3xl border bg-card p-7 shadow-sm"
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
      </div>
    </section>
  );
}
