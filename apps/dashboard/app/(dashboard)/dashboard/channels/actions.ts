"use server";

import { revalidatePath } from "next/cache";
import { db, eq, isChannelAvailable, organization } from "@trynotifly/db";
import { z } from "zod";
import { assertCanManage, getDashboardContext } from "@/lib/dashboard-context";

type State = {
  ok: boolean;
  message: string;
};

const channelSchema = z.object({
  channel: z.enum(["email", "sms", "whatsapp", "appPush"]),
  enabled: z.boolean(),
});

export async function updateChannelAction(
  _previousState: State,
  formData: FormData,
): Promise<State> {
  try {
    const context = await getDashboardContext();
    assertCanManage(context.role);
    const parsed = channelSchema.parse({
      channel: formData.get("channel"),
      enabled: formData.get("enabled") === "on",
    });

    if (parsed.enabled && !isChannelAvailable(context.organization.plan, parsed.channel)) {
      return {
        ok: false,
        message: "This channel is not available on your current plan.",
      };
    }

    await db
      .update(organization)
      .set({
        emailEnabled:
          parsed.channel === "email" ? parsed.enabled : context.organization.emailEnabled,
        smsEnabled:
          parsed.channel === "sms" ? parsed.enabled : context.organization.smsEnabled,
        whatsappEnabled:
          parsed.channel === "whatsapp" ? parsed.enabled : context.organization.whatsappEnabled,
        pushEnabled:
          parsed.channel === "appPush" ? parsed.enabled : context.organization.pushEnabled,
      })
      .where(eq(organization.id, context.organization.id));

    revalidatePath("/dashboard/channels");
    revalidatePath("/dashboard");
    return { ok: true, message: "Channel settings updated." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not update channel.",
    };
  }
}
