const industries = [
  "SaaS",
  "E-commerce",
  "Fintech",
  "Healthcare",
  "Education",
  "Logistics",
  "Marketplaces",
  "Agencies",
];

export function UseCasesIndustries() {
  return (
    <section className="border-y bg-muted/30 py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">
            Built for every industry
          </h2>

          <p className="mt-4 text-muted-foreground">
            Notification workflows vary by industry, but reliable delivery,
            visibility, and automation remain essential.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {industries.map((industry) => (
            <div
              key={industry}
              className="rounded-2xl border bg-card p-4 text-sm"
            >
              {industry}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
