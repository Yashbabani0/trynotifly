import { ChannelSettingsCard } from "@/components/dashboard/channel-settings-card";
import { getDashboardContext } from "@/lib/dashboard-context";

export default async function WhatsAppChannelPage() {
  const { organization, plan } = await getDashboardContext();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Channels</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">WhatsApp</h2>
      </div>
      <ChannelSettingsCard
        title="WhatsApp notifications"
        channel="whatsapp"
        enabled={organization.whatsappEnabled}
        available={plan.channels.whatsapp}
        description="Enable WhatsApp messaging for this organization. Plan access is enforced before the channel can be activated."
      />
    </div>
  );
}
