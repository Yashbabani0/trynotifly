import { ChannelSettingsCard } from "@/components/dashboard/channel-settings-card";
import { getDashboardContext } from "@/lib/dashboard-context";

export default async function SmsChannelPage() {
  const { organization, plan } = await getDashboardContext();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Channels</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">SMS</h2>
      </div>
      <ChannelSettingsCard
        title="SMS notifications"
        channel="sms"
        enabled={organization.smsEnabled}
        available={plan.channels.sms}
        description="Enable SMS for this organization. Provider configuration can be connected when production SMS credentials are ready."
      />
    </div>
  );
}
