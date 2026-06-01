import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SmsCta() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <div className="rounded-3xl border bg-card px-6 py-14 shadow-sm sm:px-12">
          <h2 className="text-3xl font-semibold tracking-tight">
            Start sending SMS notifications with TryNotifly
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Build OTP, alert, reminder, and transactional SMS workflows with API
            keys, usage tracking, and delivery visibility.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/pricing">View pricing</Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/contact">Contact sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
