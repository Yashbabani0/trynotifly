import {
  Activity,
  BadgeCheck,
  FileCheck2,
  KeyRound,
  MessagesSquare,
  Route,
} from "lucide-react";

const features = [
  {
    title: "SMS API",
    description:
      "Trigger SMS notifications directly from your application using a simple API.",
    icon: MessagesSquare,
  },
  {
    title: "OTP delivery",
    description:
      "Send login OTPs, signup verification codes, password reset codes, and authentication messages.",
    icon: BadgeCheck,
  },
  {
    title: "DLT-ready workflows",
    description:
      "Support Indian SMS requirements such as entity registration, sender IDs, and approved templates.",
    icon: FileCheck2,
  },
  {
    title: "Sender ID support",
    description:
      "Send transactional messages using approved sender IDs for better brand recognition.",
    icon: KeyRound,
  },
  {
    title: "Delivery reports",
    description:
      "Track message states such as sent, delivered, failed, rejected, and expired.",
    icon: Activity,
  },
  {
    title: "Provider flexibility",
    description:
      "Connect SMS delivery into your broader notification workflow with Email, WhatsApp, and Push.",
    icon: Route,
  },
];

export function SmsFeatures() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">
            SMS notifications for critical user journeys
          </h2>
          <p className="mt-4 text-muted-foreground">
            Built for authentication, transactional alerts, customer updates,
            and time-sensitive product notifications.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-3xl border bg-card p-6 shadow-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>

                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
