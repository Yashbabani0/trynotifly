import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-background to-background" />

      <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-12 text-center sm:px-6 md:pt-28 md:pb-16 lg:px-8">
        <div className="mb-6 inline-flex items-center rounded-full border bg-background px-4 py-1.5 text-sm text-muted-foreground shadow-xs">
          Multi-channel notifications for modern applications
        </div>

        <h1 className="mx-auto max-w-5xl text-balance font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          The notification infrastructure for modern applications
        </h1>

        <p className="mx-auto mt-8 max-w-3xl text-balance text-lg text-muted-foreground md:text-xl">
          Send Email, SMS, WhatsApp and Push notifications from a single API.
          Built for developers with analytics, templates, team management and
          enterprise-grade reliability.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="https://dashboard.trynotifly.com/sign-up">
              Start Free
            </Link>
          </Button>

          <Button size="lg" variant="outline" asChild>
            <Link href="https://docs.trynotifly.com">View Documentation</Link>
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground">
          <span>
            <span className="text-primary font-medium">✓</span> 500 Free Credits
          </span>
          <span>
            <span className="text-primary font-medium">✓</span> No Credit Card
            Required
          </span>
          <span>
            <span className="text-primary font-medium">✓</span> Developer First
            API
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>Email</span>
          <span>•</span>
          <span>SMS</span>
          <span>•</span>
          <span>WhatsApp</span>
          <span>•</span>
          <span>Push Notifications</span>
        </div>

        {/* <div className="mt-16 w-full max-w-6xl overflow-hidden rounded-3xl border bg-card p-3 shadow-sm">
          <div className="aspect-video rounded-2xl bg-muted">
             Dashboard screenshot goes here 
          </div>
        </div> */}
      </div>
    </section>
  );
}
