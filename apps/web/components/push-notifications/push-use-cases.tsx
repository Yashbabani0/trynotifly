const useCases = [
  "Browser notifications",
  "Mobile app alerts",
  "Cart reminders",
  "Account activity alerts",
  "Subscription reminders",
  "Product announcements",
  "Security alerts",
  "Engagement campaigns",
];

export function PushUseCases() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">
            Push notification use cases
          </h2>

          <p className="mt-4 text-muted-foreground">
            Use push notifications for real-time engagement, reminders, customer
            updates, and product activity alerts.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {useCases.map((item) => (
            <div key={item} className="rounded-2xl border bg-card p-4 text-sm">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
