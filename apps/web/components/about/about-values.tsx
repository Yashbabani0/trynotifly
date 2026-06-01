import { Code2, Eye, ShieldCheck, Zap } from "lucide-react";

const values = [
  {
    title: "Developer first",
    description:
      "Simple APIs, useful documentation, test keys, and clear dashboard workflows.",
    icon: Code2,
  },
  {
    title: "Reliability",
    description:
      "Built for critical notifications such as OTPs, invoices, alerts, and account updates.",
    icon: Zap,
  },
  {
    title: "Transparency",
    description:
      "Clear pricing, visible usage, delivery logs, and understandable billing.",
    icon: Eye,
  },
  {
    title: "Security",
    description:
      "Secure API keys, verified domains, role-based access, and abuse protection.",
    icon: ShieldCheck,
  },
];

export function AboutValues() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">
            What we care about
          </h2>

          <p className="mt-4 text-muted-foreground">
            TryNotifly is designed around practical engineering needs,
            production reliability, and simple operational control.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <div
                key={value.title}
                className="rounded-3xl border bg-card p-6 shadow-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>

                <h3 className="font-semibold">{value.title}</h3>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
