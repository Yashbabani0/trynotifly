const statuses = [
  "Queued",
  "Sent",
  "Delivered",
  "Failed",
  "Rejected",
  "Expired",
];

export function SmsDelivery() {
  return (
    <section className="border-y bg-muted/30 py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">
            Track SMS delivery status
          </h2>

          <p className="mt-4 text-muted-foreground">
            Monitor SMS activity from your dashboard and identify failed,
            rejected, or expired messages faster.
          </p>
        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {statuses.map((status) => (
              <div
                key={status}
                className="rounded-2xl border bg-background p-4 text-center text-sm font-medium"
              >
                {status}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
