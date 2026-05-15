import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db, organization, organizationBilling, eq } from "@trynotifly/db";

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

    const body = await request.json();

    // Create organization via Better Auth
    const createdOrganization = await auth.api.createOrganization({
      headers: await headers(),

      body: {
        name: body.name,
        slug: body.slug,
        logo:
          session.user.image ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            body.name,
          )}&background=111111&color=84cc16`,
      },
    });

    // Update custom organization fields
    await db
      .update(organization)
      .set({
        website: body.website || null,
        industry: body.industry,
        size: body.size,
        country: body.country,
        onboardingStep: "plan",
        onboardingCompleted: false,
      })
      .where(eq(organization.id, createdOrganization.id));

    // Create billing row
    await db.insert(organizationBilling).values({
      organizationId: createdOrganization.id,
      billingEmail: body.billingEmail,
      plan: "free",
      subscriptionStatus: "free",
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to create organization",
      },
      { status: 500 },
    );
  }
}
