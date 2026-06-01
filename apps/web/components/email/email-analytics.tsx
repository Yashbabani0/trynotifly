const analytics = [
  "Sent",
  "Delivered",
  "Failed",
  "Bounced",
  "Rejected",
  "Opened",
];

export function EmailAnalytics() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">
            Track email performance
          </h2>
          <p className="mt-4 text-muted-foreground">
            Monitor your transactional email activity from the dashboard and
            debug failed delivery attempts faster.
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
