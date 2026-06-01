import { CheckCircle2 } from "lucide-react";

const dltItems = [
  {
    title: "Entity registration",
    description:
      "Businesses sending SMS in India generally need to register their entity on an approved DLT platform.",
  },
  {
    title: "Sender ID approval",
    description:
      "Sender IDs help users identify your business and must be approved before production usage.",
  },
  {
    title: "Template approval",
    description:
      "Transactional, utility, and OTP message templates usually need approval before sending.",
  },
  {
    title: "Consent and compliance",
    description:
      "SMS workflows should follow applicable consent, template, and telecom rules for the target region.",
  },
];

export function SmsDlt() {
  return (
    <section className="border-y bg-muted/30 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                Built with Indian DLT requirements in mind
              </h2>

              <p className="mt-4 text-muted-foreground">
                For Indian SMS delivery, businesses usually need DLT
                registration, approved sender IDs, and approved message
                templates before sending production SMS traffic.
              </p>
            </div>

            <div className="space-y-5">
              {dltItems.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border bg-background p-5 text-sm leading-6 text-muted-foreground">
            TryNotifly helps teams structure SMS notification workflows around
            provider requirements, DLT-approved templates, sender IDs, delivery
            tracking, and usage limits.
          </div>
        </div>
      </div>
    </section>
  );
}
