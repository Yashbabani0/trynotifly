import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@trynotifly/db/";
import {
  eq,
  organization,
  session,
  notificationUseCases,
  eventScales,
} from "@trynotifly/db";
import { z } from "zod";

const schema = z.object({
  primaryUseCaseId: z.string().min(1),
  eventScaleId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validatedFields = schema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
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

    const useCaseExists = await db.query.notificationUseCases.findFirst({
      where: eq(notificationUseCases.id, validatedFields.data.primaryUseCaseId),
    });

    if (!useCaseExists) {
      return NextResponse.json(
        {
          error: "Invalid use case",
        },
        {
          status: 400,
        },
      );
    }

    const eventScaleExists = await db.query.eventScales.findFirst({
      where: eq(eventScales.id, validatedFields.data.eventScaleId),
    });

    if (!eventScaleExists) {
      return NextResponse.json(
        {
          error: "Invalid event scale",
        },
        {
          status: 400,
        },
      );
    }

    await db
      .update(organization)
      .set({
        primaryUseCaseId: validatedFields.data.primaryUseCaseId,
        eventScaleId: validatedFields.data.eventScaleId,

        onboardingStep: "team",
      })
      .where(eq(organization.id, activeSession.activeOrganizationId));

    return NextResponse.json({
      success: true,
    });
  } catch {
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
