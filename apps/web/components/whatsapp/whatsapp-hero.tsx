import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WhatsappHero() {
  return (
    <section className="relative overflow-hidden border-b bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border bg-card shadow-sm">
          <MessageCircle className="h-7 w-7 text-primary" />
        </div>

        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          WhatsApp Business API for customer notifications
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Send authentication, utility, and service notifications through
          WhatsApp Business from one API and dashboard.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/pricing">Start with WhatsApp</Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/contact">Contact sales</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
