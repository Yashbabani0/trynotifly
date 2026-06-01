const messageTypes = [
  {
    title: "Authentication",
    items: ["OTPs", "Login verification", "Account recovery"],
  },
  {
    title: "Utility",
    items: [
      "Order updates",
      "Shipping updates",
      "Payment receipts",
      "Appointment reminders",
    ],
  },
  {
    title: "Marketing",
    items: ["Promotional campaigns", "Announcements", "Product launches"],
  },
];

export function WhatsappMessageTypes() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">
            Support for WhatsApp message categories
          </h2>

          <p className="mt-4 text-muted-foreground">
            Send the right type of message based on the customer journey,
            template approval, and WhatsApp Business policies.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {messageTypes.map((type) => (
            <div
              key={type.title}
              className="rounded-3xl border bg-card p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold">{type.title}</h3>

              <div className="mt-5 space-y-3">
                {type.items.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border bg-background p-4 text-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 rounded-2xl border bg-muted/30 p-5 text-sm leading-6 text-muted-foreground">
          Marketing messages require user opt-in and must follow WhatsApp
          Business policies.
        </p>
      </div>
    </section>
  );
}
