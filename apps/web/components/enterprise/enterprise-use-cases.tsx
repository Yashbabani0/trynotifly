import { CheckCircle2 } from "lucide-react";

const useCases = [
  {
    title: "High-volume transactional notifications",
    points: [
      "Order updates",
      "Payment alerts",
      "Account activity",
      "Delivery notifications",
    ],
  },
  {
    title: "Mission-critical OTP and verification",
    points: [
      "Login OTPs",
      "Payment verification",
      "Account recovery",
      "Fraud alerts",
    ],
  },
  {
    title: "Multi-team notification operations",
    points: [
      "Multiple workspaces",
      "Role-based access",
      "Team invitations",
      "Usage reporting",
    ],
  },
];

export function EnterpriseUseCases() {
  return (
    <section className="border-t bg-muted/20 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-medium text-primary">Use cases</p>

            <h2 className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Designed for teams that cannot miss a notification
            </h2>

            <p className="mt-5 text-lg text-muted-foreground">
              Enterprise plans are built for businesses sending critical
              messages across Email, SMS, WhatsApp and Push.
            </p>
          </div>

          <div className="grid gap-5">
            {useCases.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border bg-card p-8 shadow-sm"
              >
                <h3 className="text-xl font-semibold">{item.title}</h3>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {item.points.map((point) => (
                    <div key={point} className="flex gap-3 text-sm">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
