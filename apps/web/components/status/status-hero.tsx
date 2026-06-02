import { Activity } from "lucide-react";

export function StatusHero() {
  return (
    <section className="border-b bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border bg-card shadow-sm">
          <Activity className="h-7 w-7 text-primary" />
        </div>

        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          TryNotifly Status
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Monitor the current availability of TryNotifly services, APIs,
          dashboard, and notification channels.
        </p>

        <div className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium shadow-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          All systems operational
        </div>
      </div>
    </section>
  );
}
