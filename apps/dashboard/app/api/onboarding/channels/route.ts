import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { db, eq, organization, session } from "@trynotifly/db";

const channelTypeSchema = z.enum([
  "transactional",
  "otp",
  "auth",
  "marketing",
  "promotional",
  "service",
  "alerts",
  "engagement",
  "updates",
]);

const channelsSchema = z.object({
  channels: z.object({
    email: z.array(channelTypeSchema).default([]),
    marketing_email: z.array(channelTypeSchema).default([]),
    sms: z.array(channelTypeSchema).default([]),
    whatsapp: z.array(channelTypeSchema).default([]),
    push: z.array(channelTypeSchema).default([]),
  }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validatedFields = channelsSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          error: "Invalid channel details",
        },
        {
          status: 400,
        },
      );
    }

    const authSession = await auth.api.getSession({
      headers: await headers(),
    });

    if (!authSession?.session.userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const activeSession = await db.query.session.findFirst({
      where: eq(session.userId, authSession.session.userId),
    });

    if (!activeSession?.activeOrganizationId) {
      return NextResponse.json(
        {
          error: "No active organization found",
        },
        {
          status: 400,
        },
      );
    }

    const activeOrganization = await db.query.organization.findFirst({
      where: eq(organization.id, activeSession.activeOrganizationId),
    });

    if (!activeOrganization) {
      return NextResponse.json(
        {
          error: "Organization not found",
        },
        {
          status: 404,
        },
      );
    }

    const selectedChannels = validatedFields.data.channels;

    const selectedChannelCount = Object.values(selectedChannels).filter(
      (types) => types.length > 0,
    ).length;

    const selectedTypeCount = Object.values(selectedChannels).reduce(
      (total, types) => total + types.length,
      0,
    );

    if (selectedTypeCount === 0) {
      return NextResponse.json(
        {
          error: "Select at least one channel or skip this step",
        },
        {
          status: 400,
        },
      );
    }

    const existingSettings =
      activeOrganization.settings &&
      typeof activeOrganization.settings === "object" &&
      !Array.isArray(activeOrganization.settings)
        ? activeOrganization.settings
        : {};

    await db
      .update(organization)
      .set({
        settings: {
          ...existingSettings,
          onboarding: {
            ...(typeof existingSettings.onboarding === "object" &&
            existingSettings.onboarding !== null &&
            !Array.isArray(existingSettings.onboarding)
              ? existingSettings.onboarding
              : {}),
            channels: selectedChannels,
            channelSummary: {
              selectedChannelCount,
              selectedTypeCount,
            },
          },
        },
        onboardingStep: "first_event",
        updatedAt: new Date(),
      })
      .where(eq(organization.id, activeOrganization.id));

    return NextResponse.json({
      success: true,
      selectedChannelCount,
      selectedTypeCount,
    });
  } catch (error) {
    console.error("[ONBOARDING_CHANNELS_ERROR]", error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}
