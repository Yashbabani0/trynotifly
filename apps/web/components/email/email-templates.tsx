const templates = [
  {
    title: "OTP email",
    description: "Send one-time passwords for login, signup, and verification.",
  },
  {
    title: "Invoice email",
    description: "Send payment receipts, invoices, and billing confirmations.",
  },
  {
    title: "Password reset",
    description: "Send secure reset links for account recovery workflows.",
  },
  {
    title: "Order update",
    description:
      "Send order placed, shipped, delivered, and cancelled updates.",
  },
];

export function EmailTemplates() {
  return (
    <section className="border-y bg-muted/30 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">
            Templates for every transactional flow
          </h2>
          <p className="mt-4 text-muted-foreground">
            Create consistent, reusable email templates for common product and
            business notifications.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((template) => (
            <div
              key={template.title}
              className="rounded-3xl border bg-card p-6 shadow-sm"
            >
              <h3 className="font-semibold">{template.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {template.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
