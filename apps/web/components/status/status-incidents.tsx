import { CheckCircle2 } from "lucide-react";

const incidents = [
  {
    title: "No active incidents",
    date: "Current status",
    description:
      "There are no known active incidents affecting TryNotifly services at this time.",
  },
];

export function StatusIncidents() {
  return (
    <section className="border-y bg-muted/30 py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">
            Incident history
          </h2>

          <p className="mt-4 text-muted-foreground">
            Recent platform incidents, maintenance updates, and service
            availability notices.
          </p>
        </div>

        <div className="mt-10 divide-y rounded-3xl border bg-card px-6 shadow-sm">
          {incidents.map((incident) => (
            <article key={incident.title} className="py-6">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-500" />

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-semibold">{incident.title}</h3>
                    <span className="text-sm text-muted-foreground">
                      {incident.date}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {incident.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}