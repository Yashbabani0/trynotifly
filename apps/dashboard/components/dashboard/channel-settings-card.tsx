import Link from "next/link";
import { ActionSubmit } from "@/components/dashboard/action-submit";
import { ServerActionForm } from "@/components/dashboard/server-action-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateChannelAction } from "@/app/(dashboard)/dashboard/channels/actions";

export function ChannelSettingsCard({
  title,
  channel,
  enabled,
  available,
  description,
  setupHref,
  stats,
}: {
  title: string;
  channel: "email" | "sms" | "whatsapp" | "appPush";
  enabled: boolean;
  available: boolean;
  description: string;
  setupHref?: string;
  stats?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
          <Badge variant={enabled ? "default" : available ? "outline" : "destructive"}>
            {enabled ? "Enabled" : available ? "Disabled" : "Locked"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats}
        <ServerActionForm action={updateChannelAction} className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="channel" value={channel} />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="enabled"
              defaultChecked={enabled}
              disabled={!available}
              className="size-4 rounded border-input"
            />
            Enable channel
          </label>
          <ActionSubmit pendingLabel="Updating" className={!available ? "hidden" : undefined}>
            Save
          </ActionSubmit>
          {setupHref ? (
            <Button asChild variant="outline">
              <Link href={setupHref}>Open setup</Link>
            </Button>
          ) : null}
        </ServerActionForm>
      </CardContent>
    </Card>
  );
}
