import { CheckCircle2 } from "lucide-react";

const records = [
  {
    title: "SPF",
    description:
      "Helps receiving mail servers confirm which services are allowed to send email for your domain.",
  },
  {
    title: "DKIM",
    description:
      "Adds cryptographic signing so inbox providers can verify that emails were not modified in transit.",
  },
  {
    title: "DMARC",
    description:
      "Defines how receiving servers should handle emails that fail SPF or DKIM checks.",
  },
];

export function EmailDomainVerification() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                Domain verification built in
              </h2>
              <p className="mt-4 text-muted-foreground">
                Verify your sending domain before production use. TryNotifly
                helps you configure the required DNS records for safer, branded,
                and more trusted email delivery.
              </p>
            </div>

            <div className="space-y-5">
              {records.map((record) => (
                <div key={record.title} className="flex gap-4">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <h3 className="font-semibold">{record.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {record.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
