const useCases = [
  "Login OTPs",
  "Signup verification",
  "Password reset codes",
  "Payment alerts",
  "Order updates",
  "Delivery notifications",
  "Security alerts",
  "Appointment reminders",
];

export function SmsUseCases() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">
            SMS use cases
          </h2>

          <p className="mt-4 text-muted-foreground">
            Use SMS for important notifications where speed, visibility, and
            direct delivery matter.
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
