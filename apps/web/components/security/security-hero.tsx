import { ShieldCheck } from "lucide-react";

export function SecurityHero() {
  return (
    <section className="relative overflow-hidden border-b bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border bg-card shadow-sm">
          <ShieldCheck className="h-7 w-7 text-primary" />
        </div>

        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          Security built for reliable notifications
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          TryNotifly is designed to protect your organization, API keys,
          notification data, domains, and delivery workflows across Email, SMS,
          WhatsApp, and Push.
        </p>
      </div>
    </section>
  );
}
