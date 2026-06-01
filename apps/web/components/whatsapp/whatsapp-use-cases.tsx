const useCases = [
  "OTP verification",
  "Order tracking",
  "Delivery updates",
  "Payment confirmations",
  "Account alerts",
  "Appointment reminders",
  "Customer support",
  "Subscription notifications",
];

export function WhatsappUseCases() {
  return (
    <section className="border-y bg-muted/30 py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">
            WhatsApp use cases
          </h2>

          <p className="mt-4 text-muted-foreground">
            Use WhatsApp for high-visibility notifications where customers
            already expect fast, conversational communication.
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
