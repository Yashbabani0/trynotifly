import { ShieldAlert } from "lucide-react";

export function AcceptableUseHero() {
  return (
    <section className="border-b bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border bg-card shadow-sm">
          <ShieldAlert className="h-7 w-7 text-primary" />
        </div>

        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          Acceptable Use Policy
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          This policy explains how TryNotifly may and may not be used across
          Email, SMS, WhatsApp, Push, APIs, dashboards, and related services.
        </p>

        <p className="mt-6 text-sm text-muted-foreground">
          Last updated: June 1, 2026
        </p>
      </div>
    </section>
  );
}
