import { PushAnalytics } from "@/components/push-notifications/push-analytics";
import { PushCta } from "@/components/push-notifications/push-cta";
import { PushFeatures } from "@/components/push-notifications/push-features";
import { PushHero } from "@/components/push-notifications/push-hero";
import { PushPlatforms } from "@/components/push-notifications/push-platforms";
import { PushUseCases } from "@/components/push-notifications/push-use-cases";

export default function PushNotificationsPage() {
  return (
    <main>
      <PushHero />
      <PushFeatures />
      <PushPlatforms />
      <PushUseCases />
      <PushAnalytics />
      <PushCta />
    </main>
  );
}
