import {
  and,
  db,
  eq,
  invitation,
  member,
  organization,
  user,
} from "@trynotifly/db";
import { getEmailEnv } from "@/lib/env";
import { sendOrganizationInvitationEmail } from "@/lib/email";

export async function inviteMember(input: {
  inviterId: string;
  organizationId: string;
  email: string;
  role: "admin" | "member";
}) {
  const [org, inviterMembership, invitedUser] = await Promise.all([
    db.query.organization.findFirst({
      where: eq(organization.id, input.organizationId),
    }),
    db.query.member.findFirst({
      where: and(
        eq(member.organizationId, input.organizationId),
        eq(member.userId, input.inviterId),
      ),
      with: {
        user: true,
      },
    }),
    db.query.user.findFirst({
      where: eq(user.email, input.email),
    }),
  ]);

  if (!org || !inviterMembership) {
    throw new Error("Workspace not found.");
  }

  if (!["owner", "admin"].includes(inviterMembership.role)) {
    throw new Error("Only owners and admins can invite teammates.");
  }

  if (invitedUser) {
    const existingMember = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, input.organizationId),
        eq(member.userId, invitedUser.id),
      ),
    });

    if (existingMember) {
      throw new Error("This user is already a workspace member.");
    }
  }

  const existingInvite = await db.query.invitation.findFirst({
    where: and(
      eq(invitation.organizationId, input.organizationId),
      eq(invitation.email, input.email),
      eq(invitation.status, "pending"),
    ),
  });

  if (existingInvite && existingInvite.expiresAt > new Date()) {
    throw new Error("A pending invitation already exists for this email.");
  }

  const invitationId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  await db.insert(invitation).values({
    id: invitationId,
    organizationId: input.organizationId,
    email: input.email,
    role: input.role,
    status: "pending",
    expiresAt,
    inviterId: input.inviterId,
  });

  await sendOrganizationInvitationEmail({
    to: input.email,
    inviterName: inviterMembership.user.name,
    organizationName: org.name,
    role: input.role,
    invitationUrl: `${getEmailEnv().APP_URL}/accept-invitation?id=${invitationId}`,
  });

  return invitationId;
}

export async function acceptInvitation(input: {
  invitationId: string;
  userId: string;
  userEmail: string;
}) {
  return db.transaction(async (tx) => {
    const invite = await tx.query.invitation.findFirst({
      where: eq(invitation.id, input.invitationId),
    });

    if (!invite) {
      throw new Error("Invitation not found.");
    }

    if (invite.status !== "pending") {
      throw new Error("This invitation is no longer pending.");
    }

    if (invite.expiresAt <= new Date()) {
      await tx
        .update(invitation)
        .set({ status: "expired" })
        .where(eq(invitation.id, invite.id));
      throw new Error("This invitation has expired.");
    }

    if (invite.email.toLowerCase() !== input.userEmail.toLowerCase()) {
      throw new Error("Sign in with the email address that received this invitation.");
    }

    const existingMember = await tx.query.member.findFirst({
      where: and(
        eq(member.organizationId, invite.organizationId),
        eq(member.userId, input.userId),
      ),
    });

    if (!existingMember) {
      await tx.insert(member).values({
        id: crypto.randomUUID(),
        organizationId: invite.organizationId,
        userId: input.userId,
        role: invite.role ?? "member",
        createdAt: new Date(),
      });
    }

    await tx
      .update(invitation)
      .set({ status: "accepted" })
      .where(eq(invitation.id, invite.id));
  });
}
