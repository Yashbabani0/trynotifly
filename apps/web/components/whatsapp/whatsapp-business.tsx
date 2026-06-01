import { CheckCircle2 } from "lucide-react";

const items = [
  {
    title: "Meta Business verification",
    description:
      "Businesses may need Meta verification depending on scale, account setup, and WhatsApp Business requirements.",
  },
  {
    title: "Display name approval",
    description:
      "Your WhatsApp display name should match your business, brand, or product identity.",
  },
  {
    title: "Phone number setup",
    description:
      "A dedicated phone number is usually required for WhatsApp Business messaging.",
  },
  {
    title: "Template approval",
    description:
      "Outbound business-initiated messages usually require approved WhatsApp templates.",
  },
];

export function WhatsappBusiness() {
  return (
    <section className="border-y bg-muted/30 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                Built around WhatsApp Business requirements
              </h2>

              <p className="mt-4 text-muted-foreground">
                WhatsApp Business messaging requires the right account setup,
                approved templates, verified business details, and compliant
                customer communication workflows.
              </p>
            </div>

            <div className="space-y-5">
              {items.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.description}
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
