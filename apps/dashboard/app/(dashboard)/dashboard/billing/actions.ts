"use server";

import { revalidatePath } from "next/cache";
import {
  db,
  eq,
  getPlanDefinition,
  normalizePlanSlug,
  organization,
  organizationBilling,
  plans,
  type PlanSlug,
} from "@trynotifly/db";
import { z } from "zod";
import { assertCanManage, getDashboardContext } from "@/lib/dashboard-context";

type State = {
  ok: boolean;
  message: string;
};

const planSchema = z.object({
  plan: z.enum(["FREE", "STARTER", "PREMIUM", "BUSINESS", "ENTERPRISE"]),
});

export async function changePlanAction(
  _previousState: State,
  formData: FormData,
): Promise<State> {
  try {
    const context = await getDashboardContext();
    assertCanManage(context.role);
    const parsed = planSchema.parse({ plan: formData.get("plan") });
    const target = getPlanDefinition(parsed.plan);
    const dbPlan = await db.query.plans.findFirst({
      where: eq(plans.slug, target.slug),
    });

    await db.transaction(async (tx) => {
      await tx
        .update(organization)
        .set({
          plan: normalizePlanSlug(target.slug),
        })
        .where(eq(organization.id, context.organization.id));

      await tx
        .insert(organizationBilling)
        .values({
          organizationId: context.organization.id,
          planId: dbPlan?.id,
          planSlug: target.slug as PlanSlug,
          billingProvider: "manual",
          billingInterval: target.isContactSales ? "manual" : "monthly",
          status: target.isContactSales ? "contact_sales" : "active",
          currentPeriodStart: new Date(),
          currentPeriodEnd: target.isContactSales
            ? null
            : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        })
        .onConflictDoUpdate({
          target: organizationBilling.organizationId,
          set: {
            planId: dbPlan?.id,
            planSlug: target.slug,
            billingInterval: target.isContactSales ? "manual" : "monthly",
            status: target.isContactSales ? "contact_sales" : "active",
            currentPeriodStart: new Date(),
            currentPeriodEnd: target.isContactSales
              ? null
              : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
            updatedAt: new Date(),
          },
        });
    });

    revalidatePath("/dashboard");
    return {
      ok: true,
      message: target.isContactSales
        ? "Enterprise marked for contact sales."
        : `${target.name} plan activated manually.`,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not update plan.",
    };
  }
}
