import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db, organizationBilling, plan, eq } from "@trynotifly/db";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const organizationId = session.session.activeOrganizationId;

    if (!organizationId) {
      return NextResponse.json(
        {
          message: "No active organization",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const selectedPlan = await db.query.plan.findFirst({
      where: eq(plan.slug, body.planSlug),
    });

    if (!selectedPlan) {
      return NextResponse.json(
        {
          message: "Invalid plan",
        },
        { status: 400 },
      );
    }

    await db
      .update(organizationBilling)
      .set({
        plan: selectedPlan.slug as "free" | "pro" | "growth" | "enterprise",

        subscriptionStatus: selectedPlan.slug === "free" ? "free" : "pending",

        updatedAt: new Date(),
      })
      .where(eq(organizationBilling.organizationId, organizationId));

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to select plan",
      },
      { status: 500 },
    );
  }
}
