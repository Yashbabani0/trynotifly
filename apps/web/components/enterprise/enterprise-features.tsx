import {
  BarChart3,
  Headphones,
  Lock,
  Server,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

const features = [
  {
    title: "Custom credits",
    description:
      "Get custom monthly credit limits based on your notification volume.",
    icon: SlidersHorizontal,
  },
  {
    title: "Higher throughput",
    description:
      "Scale delivery limits for production workloads and high-volume sends.",
    icon: Server,
  },
  {
    title: "SLA options",
    description:
      "Add response and reliability commitments for critical workflows.",
    icon: ShieldCheck,
  },
  {
    title: "Dedicated support",
    description:
      "Work with priority support for implementation, scaling and issue resolution.",
    icon: Headphones,
  },
  {
    title: "Advanced reporting",
    description:
      "Get deeper usage visibility, channel analytics and delivery insights.",
    icon: BarChart3,
  },
  {
    title: "Security controls",
    description:
      "Support team roles, API key controls, domain verification and audit-friendly workflows.",
    icon: Lock,
  },
];

export function EnterpriseFeatures() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-primary">Built for scale</p>

          <h2 className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Enterprise features for serious notification workloads
          </h2>

          <p className="mt-5 text-balance text-lg text-muted-foreground">
            Everything your team needs to scale notifications reliably across
            customers, teams and regions.
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
