import {
  Activity,
  Bell,
  Braces,
  Layers3,
  MousePointerClick,
  UsersRound,
} from "lucide-react";

const features = [
  {
    title: "Push API",
    description:
      "Trigger push notifications from your backend using a simple developer-friendly API.",
    icon: Braces,
  },
  {
    title: "Web push",
    description:
      "Send notifications to users through supported browsers for product updates and reminders.",
    icon: Bell,
  },
  {
    title: "Mobile push",
    description:
      "Support mobile app notification workflows for Android and iOS applications.",
    icon: Layers3,
  },
  {
    title: "User segmentation",
    description:
      "Target users based on app activity, notification preferences, and customer journeys.",
    icon: UsersRound,
  },
  {
    title: "Click tracking",
    description:
      "Track interactions and understand which notifications drive engagement.",
    icon: MousePointerClick,
  },
  {
    title: "Delivery analytics",
    description:
      "Monitor sent, delivered, failed, opened, and clicked notification events.",
    icon: Activity,
  },
];

export function PushFeatures() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">
            Push notifications built for engagement
          </h2>
          <p className="mt-4 text-muted-foreground">
            Reach users with timely alerts, reminders, and product updates
            across web and mobile channels.
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
