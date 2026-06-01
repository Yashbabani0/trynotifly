const platformItems = [
  "Email",
  "SMS",
  "WhatsApp",
  "Push Notifications",
  "API Keys",
  "Templates",
  "Domains",
  "Delivery Logs",
  "Analytics",
  "Organizations",
  "Credits",
  "Billing",
];

export function AboutPlatform() {
  return (
    <section className="border-y bg-muted/30 py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">
            One platform for notification infrastructure
          </h2>

          <p className="mt-4 text-muted-foreground">
            TryNotifly combines the tools needed to send, monitor, and manage
            customer notifications across multiple channels.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {platformItems.map((item) => (
            <div key={item} className="rounded-2xl border bg-card p-4 text-sm">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
