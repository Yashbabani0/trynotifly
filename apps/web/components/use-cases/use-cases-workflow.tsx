const workflow = [
  "User action triggers event",
  "TryNotifly receives request",
  "Channel selected automatically",
  "Notification delivered",
  "Delivery status tracked",
  "Analytics updated",
];

export function UseCasesWorkflow() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-semibold tracking-tight">
          Typical notification workflow
        </h2>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {workflow.map((step, index) => (
            <div
              key={step}
              className="rounded-3xl border bg-card p-6 text-center shadow-sm"
            >
              <div className="mb-4 text-sm font-medium text-primary">
                Step {index + 1}
              </div>

              <p className="text-sm">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
