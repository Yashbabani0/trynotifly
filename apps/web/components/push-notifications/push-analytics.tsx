const analytics = [
  "Queued",
  "Sent",
  "Delivered",
  "Failed",
  "Opened",
  "Clicked",
];

export function PushAnalytics() {
  return (
    <section className="border-y bg-muted/30 py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">
            Measure push performance
          </h2>

          <p className="mt-4 text-muted-foreground">
            Track delivery and engagement events to understand how users respond
            to your notifications.
          </p>
        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {analytics.map((item) => (
              <div
                key={item}
                className="rounded-2xl border bg-background p-4 text-center text-sm font-medium"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
