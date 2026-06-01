import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PrivacyCta() {
  return (
    <section className="border-t bg-muted/30 py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <div className="rounded-3xl border bg-card px-6 py-14 shadow-sm sm:px-12">
          <h2 className="text-3xl font-semibold tracking-tight">
            Have a privacy question?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Contact TryNotifly for questions about data handling, account
            privacy, notification data, or compliance workflows.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/contact">Contact us</Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/security">View security</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
