import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SmsHero() {
  return (
    <section className="relative overflow-hidden border-b bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border bg-card shadow-sm">
          <MessageSquareText className="h-7 w-7 text-primary" />
        </div>

        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          SMS API for OTPs, alerts, and transactional messaging
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Send OTPs, verification codes, payment alerts, order updates, and
          transactional SMS from one reliable notification platform.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/pricing">Start sending SMS</Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/contact">Talk to sales</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
