import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { addDays } from "date-fns";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { sendInvitationEmail } from "@/lib/mail/send-Invitation-email";
import {
  db,
  invitation,
  organization,
  session,
  user,
  and,
  eq,
} from "@trynotifly/db";

const inviteSchema = z.object({
  invites: z
    .array(
      z.object({
        email: z.email(),
        role: z.enum(["admin", "member", "viewer"]),
      }),
    )
    .min(1)
    .max(10),
});

export async function POST(req: Request) {
  try {
    const appUrl = process.env.BETTER_AUTH_URL;

    if (!appUrl) {
      console.error(
        "[ONBOARDING_TEAM_INVITE_ERROR]",
        "BETTER_AUTH_URL is not set",
      );

      return NextResponse.json(
        {
          error: "Application URL is not configured",
        },
        {
          status: 500,
        },
      );
    }

    const body = await req.json();

    const validatedFields = inviteSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          error: "Invalid invite details",
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

    const inviter = await db.query.user.findFirst({
      where: eq(user.id, authSession.session.userId),
    });

    if (!inviter) {
      return NextResponse.json(
        {
          error: "Inviter not found",
        },
        {
          status: 404,
        },
      );
    }

    const uniqueInvites = Array.from(
      new Map(
        validatedFields.data.invites.map((invite) => [
          invite.email.toLowerCase().trim(),
          {
            email: invite.email.toLowerCase().trim(),
            role: invite.role,
          },
        ]),
      ).values(),
    );

    let sentCount = 0;

    for (const invite of uniqueInvites) {
      const existingInvitation = await db.query.invitation.findFirst({
        where: and(
          eq(invitation.organizationId, activeOrganization.id),
          eq(invitation.email, invite.email),
        ),
      });

      const expiresAt = addDays(new Date(), 7);

      let invitationId: string;

      if (existingInvitation) {
        const [updatedInvitation] = await db
          .update(invitation)
          .set({
            role: invite.role,
            status: "pending",
            expiresAt,
            inviterId: inviter.id,
            updatedAt: new Date(),
          })
          .where(eq(invitation.id, existingInvitation.id))
          .returning({
            id: invitation.id,
          });

        if (!updatedInvitation) {
          return NextResponse.json(
            {
              error: "Failed to update invitation",
            },
            {
              status: 500,
            },
          );
        }

        invitationId = updatedInvitation.id;
      } else {
        const [createdInvitation] = await db
          .insert(invitation)
          .values({
            organizationId: activeOrganization.id,
            email: invite.email,
            role: invite.role,
            status: "pending",
            expiresAt,
            inviterId: inviter.id,
          })
          .returning({
            id: invitation.id,
          });

        if (!createdInvitation) {
          return NextResponse.json(
            {
              error: "Failed to create invitation",
            },
            {
              status: 500,
            },
          );
        }

        invitationId = createdInvitation.id;
      }

      const inviteUrl = `${appUrl}/accept-invitation/${invitationId}`;

      await sendInvitationEmail(
        activeOrganization.name,
        inviteUrl,
        invite.email,
        inviter.name,
      );

      sentCount++;
    }

    await db
      .update(organization)
      .set({
        onboardingStep: "channels",
        updatedAt: new Date(),
      })
      .where(eq(organization.id, activeOrganization.id));

    return NextResponse.json({
      success: true,
      sentCount,
    });
  } catch (error) {
    console.error("[ONBOARDING_TEAM_INVITE_ERROR]", error);

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
