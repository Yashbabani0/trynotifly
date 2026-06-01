import { SmsCta } from "@/components/sms/sms-cta";
import { SmsDelivery } from "@/components/sms/sms-delivery";
import { SmsDlt } from "@/components/sms/sms-dlt";
import { SmsFaq } from "@/components/sms/sms-faq";
import { SmsFeatures } from "@/components/sms/sms-features";
import { SmsHero } from "@/components/sms/sms-hero";
import { SmsUseCases } from "@/components/sms/sms-use-cases";

export default function SmsPage() {
  return (
    <main>
      <SmsHero />
      <SmsFeatures />
      <SmsDlt />
      <SmsUseCases />
      <SmsDelivery />
      <SmsFaq />
      <SmsCta />
    </main>
  );
}
