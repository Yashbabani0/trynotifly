const platforms = [
  {
    title: "Browser notifications",
    description:
      "Send web push notifications to users who opt in through supported browsers.",
  },
  {
    title: "Mobile app notifications",
    description:
      "Send mobile alerts for app activity, reminders, account updates, and user engagement.",
  },
  {
    title: "Product lifecycle messages",
    description:
      "Trigger notifications based on events such as signups, inactivity, purchases, or renewals.",
  },
];

export function PushPlatforms() {
  return (
    <section className="border-y bg-muted/30 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-10">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight">
              Web push and mobile push from one workflow
            </h2>

            <p className="mt-4 text-muted-foreground">
              Create notification flows that reach users on the right device and
              channel at the right time.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {platforms.map((platform) => (
              <div
                key={platform.title}
                className="rounded-2xl border bg-background p-5"
              >
                <h3 className="font-semibold">{platform.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {platform.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
