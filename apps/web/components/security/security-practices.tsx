import { CheckCircle2 } from "lucide-react";

const practices = [
  "Use test and live API keys separately.",
  "Revoke leaked or unused API keys immediately.",
  "Verify sending domains before production use.",
  "Use SPF, DKIM, and DMARC for email deliverability and protection.",
  "Invite team members with the lowest role needed.",
  "Monitor failed delivery attempts and suspicious API usage.",
  "Keep webhook secrets, provider keys, and database URLs outside source code.",
  "Use HTTPS for all dashboard, API, and webhook traffic.",
];

export function SecurityPractices() {
  return (
    <section className="border-y bg-muted/30 py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">
            Recommended security practices
          </h2>
          <p className="mt-4 text-muted-foreground">
            These practices help your team use TryNotifly safely in production.
          </p>
        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="space-y-4">
            {practices.map((practice) => (
              <div key={practice} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm leading-6 text-muted-foreground">
                  {practice}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
