const useCases = [
  "OTP and login verification",
  "Password reset emails",
  "Account alerts",
  "Order confirmation emails",
  "Invoice and receipt emails",
  "Shipping and delivery updates",
  "Subscription billing alerts",
  "Product activity notifications",
];

export function EmailUseCases() {
  return (
    <section className="border-y bg-muted/30 py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">
            Common email use cases
          </h2>
          <p className="mt-4 text-muted-foreground">
            Send critical product emails that your users expect to receive
            quickly and reliably.
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
