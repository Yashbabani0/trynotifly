const categories = [
  {
    title: "Authentication",
    description:
      "OTPs, login verification, signup confirmation, and account recovery.",
  },
  {
    title: "Transactional",
    description:
      "Order confirmations, invoices, payment receipts, and delivery updates.",
  },
  {
    title: "Security",
    description:
      "Account alerts, suspicious login notifications, and password changes.",
  },
  {
    title: "Customer Engagement",
    description:
      "Reminders, announcements, product updates, and lifecycle messaging.",
  },
  {
    title: "Operations",
    description:
      "Internal alerts, monitoring notifications, and workflow events.",
  },
  {
    title: "Support",
    description:
      "Ticket updates, appointment reminders, and customer communication.",
  },
];

export function UseCasesCategories() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.title}
              className="rounded-3xl border bg-card p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold">{category.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {category.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
