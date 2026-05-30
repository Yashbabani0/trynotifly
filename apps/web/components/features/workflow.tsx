import { ArrowRight, BarChart3, Code2, FileText, Send } from "lucide-react";

const steps = [
  {
    title: "Create template",
    description: "Build reusable messages for Email, SMS and WhatsApp.",
    icon: FileText,
  },
  {
    title: "Send via API",
    description: "Trigger notifications from your backend or app.",
    icon: Code2,
  },
  {
    title: "Deliver message",
    description: "Route messages through the right channel provider.",
    icon: Send,
  },
  {
    title: "Track results",
    description: "Monitor delivery, failures and channel performance.",
    icon: BarChart3,
  },
];

export function Workflow() {
  return (
    <section className="border-t bg-muted/20 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-primary">Workflow</p>

          <h2 className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            From template to delivery in one flow
          </h2>

          <p className="mt-5 text-balance text-lg text-muted-foreground">
            Create templates, trigger messages through the API and monitor
            delivery from a single dashboard.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={step.title} className="relative">
                <div className="h-full rounded-3xl border bg-card p-8 shadow-sm">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold tracking-tight">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <ArrowRight className="absolute -right-4 top-1/2 hidden size-5 -translate-y-1/2 text-muted-foreground lg:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
