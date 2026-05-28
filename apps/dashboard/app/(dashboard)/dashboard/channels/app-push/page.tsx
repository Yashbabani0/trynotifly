import { ChannelSettingsCard } from "@/components/dashboard/channel-settings-card";
import { getDashboardContext } from "@/lib/dashboard-context";

export default async function AppPushChannelPage() {
  const { organization, plan } = await getDashboardContext();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Channels</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">App Push</h2>
      </div>
      <ChannelSettingsCard
        title="App push notifications"
        channel="appPush"
        enabled={organization.pushEnabled}
        available={plan.channels.appPush}
        description="Enable app push notifications for device-token based product messaging."
      />
    </div>
  );
}
