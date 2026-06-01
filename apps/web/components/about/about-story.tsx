export function AboutStory() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">
            Why TryNotifly exists
          </h2>

          <p className="mt-4 text-muted-foreground">
            Notification infrastructure is often fragmented. Teams use one tool
            for email, another for SMS, another for WhatsApp, and another for
            push notifications.
          </p>
        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
          <p className="text-sm leading-7 text-muted-foreground">
            TryNotifly brings these channels together so teams can manage
            sending, API keys, templates, delivery logs, credits, analytics, and
            channel configuration from a single place. The goal is to make
            notification infrastructure simpler, clearer, and easier to scale.
          </p>
        </div>
      </div>
    </section>
  );
}
