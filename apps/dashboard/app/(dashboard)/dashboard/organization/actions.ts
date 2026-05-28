"use server";

import { revalidatePath } from "next/cache";
import {
  and,
  checkPlanLimit,
  count,
  db,
  eq,
  getPlanDefinition,
  invitation,
  member,
  organization,
  user,
} from "@trynotifly/db";
import { z } from "zod";
import {
  assertCanManage,
  DashboardError,
  getDashboardContext,
} from "@/lib/dashboard-context";
import { inviteMember } from "@/lib/invitations";
import { sendOrganizationInvitationEmail } from "@/lib/email";
import { getEmailEnv } from "@/lib/env";

type ActionState = {
  ok: boolean;
  message: string;
};

function result(ok: boolean, message: string): ActionState {
  return { ok, message };
}

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function formatError(error: unknown) {
  if (error instanceof DashboardError || error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

const organizationSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  website: z.string().url().optional().or(z.literal("")),
  timezone: z.string().min(2).max(100),
  industry: z.string().min(2).max(100),
  useCase: z.string().min(2).max(100),
});

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member"]),
});

const roleSchema = z.object({
  memberId: z.string().min(1),
  role: z.enum(["owner", "admin", "member"]),
});

export async function updateOrganizationAction(
  _previousState: ActionState,
  formData: FormData,
) {
  try {
    const context = await getDashboardContext();
    assertCanManage(context.role);

    const parsed = organizationSchema.parse({
      name: formString(formData, "name"),
      slug: formString(formData, "slug").toLowerCase(),
      website: formString(formData, "website"),
      timezone: formString(formData, "timezone"),
      industry: formString(formData, "industry"),
      useCase: formString(formData, "useCase"),
    });

    const slugOwner = await db.query.organization.findFirst({
      where: eq(organization.slug, parsed.slug),
    });

    if (slugOwner && slugOwner.id !== context.organization.id) {
      return result(false, "That organization slug is already taken.");
    }

    await db
      .update(organization)
      .set({
        ...parsed,
        website: parsed.website || null,
      })
      .where(eq(organization.id, context.organization.id));

    revalidatePath("/dashboard");
    return result(true, "Organization updated.");
  } catch (error) {
    return result(false, formatError(error));
  }
}

export async function inviteMemberAction(
  _previousState: ActionState,
  formData: FormData,
) {
  try {
    const context = await getDashboardContext();
    assertCanManage(context.role);

    const parsed = inviteSchema.parse({
      email: formString(formData, "email").toLowerCase(),
      role: formString(formData, "role"),
    });
    const plan = getPlanDefinition(context.organization.plan);
    const [memberCount] = await db
      .select({ value: count() })
      .from(member)
      .where(eq(member.organizationId, context.organization.id));
    const limit = checkPlanLimit({
      plan: plan.slug,
      key: "members",
      current: memberCount?.value ?? 0,
    });

    if (!limit.allowed) {
      return result(false, limit.message);
    }

    await inviteMember({
      inviterId: context.user.id,
      organizationId: context.organization.id,
      email: parsed.email,
      role: parsed.role,
    });

    revalidatePath("/dashboard/organization");
    return result(true, "Invitation sent.");
  } catch (error) {
    return result(false, formatError(error));
  }
}

async function ownerCount(organizationId: string) {
  const [owners] = await db
    .select({ value: count() })
    .from(member)
    .where(and(eq(member.organizationId, organizationId), eq(member.role, "owner")));
  return owners?.value ?? 0;
}

export async function updateMemberRoleAction(
  _previousState: ActionState,
  formData: FormData,
) {
  try {
    const context = await getDashboardContext();
    assertCanManage(context.role);
    const parsed = roleSchema.parse({
      memberId: formString(formData, "memberId"),
      role: formString(formData, "role"),
    });
    const target = await db.query.member.findFirst({
      where: and(
        eq(member.id, parsed.memberId),
        eq(member.organizationId, context.organization.id),
      ),
    });

    if (!target) {
      return result(false, "Member not found.");
    }

    if (target.role === "owner" && parsed.role !== "owner" && (await ownerCount(context.organization.id)) <= 1) {
      return result(false, "You cannot demote the last owner.");
    }

    await db
      .update(member)
      .set({ role: parsed.role })
      .where(eq(member.id, parsed.memberId));

    revalidatePath("/dashboard/organization/members");
    return result(true, "Member role updated.");
  } catch (error) {
    return result(false, formatError(error));
  }
}

export async function removeMemberAction(
  _previousState: ActionState,
  formData: FormData,
) {
  try {
    const context = await getDashboardContext();
    assertCanManage(context.role);
    const memberId = formString(formData, "memberId");
    const target = await db.query.member.findFirst({
      where: and(eq(member.id, memberId), eq(member.organizationId, context.organization.id)),
    });

    if (!target) {
      return result(false, "Member not found.");
    }

    if (target.role === "owner" && (await ownerCount(context.organization.id)) <= 1) {
      return result(false, "You cannot remove the last owner.");
    }

    await db.delete(member).where(eq(member.id, memberId));
    revalidatePath("/dashboard/organization/members");
    return result(true, "Member removed.");
  } catch (error) {
    return result(false, formatError(error));
  }
}

export async function revokeInvitationAction(
  _previousState: ActionState,
  formData: FormData,
) {
  try {
    const context = await getDashboardContext();
    assertCanManage(context.role);
    const invitationId = formString(formData, "invitationId");

    await db
      .update(invitation)
      .set({ status: "revoked" })
      .where(
        and(
          eq(invitation.id, invitationId),
          eq(invitation.organizationId, context.organization.id),
        ),
      );

    revalidatePath("/dashboard/organization/invitations");
    return result(true, "Invitation revoked.");
  } catch (error) {
    return result(false, formatError(error));
  }
}

export async function resendInvitationAction(
  _previousState: ActionState,
  formData: FormData,
) {
  try {
    const context = await getDashboardContext();
    assertCanManage(context.role);
    const invitationId = formString(formData, "invitationId");
    const existing = await db.query.invitation.findFirst({
      where: and(
        eq(invitation.id, invitationId),
        eq(invitation.organizationId, context.organization.id),
      ),
    });

    if (!existing || existing.status !== "pending") {
      return result(false, "Only pending invitations can be resent.");
    }

    const invitedUser = await db.query.user.findFirst({
      where: eq(user.email, existing.email),
    });

    if (invitedUser) {
      const existingMember = await db.query.member.findFirst({
        where: and(
          eq(member.organizationId, context.organization.id),
          eq(member.userId, invitedUser.id),
        ),
      });

      if (existingMember) {
        return result(false, "This user is already a member.");
      }
    }

    await db
      .update(invitation)
      .set({
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        createdAt: new Date(),
      })
      .where(eq(invitation.id, existing.id));

    await sendOrganizationInvitationEmail({
      to: existing.email,
      inviterName: context.user.name ?? context.user.email,
      organizationName: context.organization.name,
      role: existing.role ?? "member",
      invitationUrl: `${getEmailEnv().APP_URL}/accept-invitation?id=${existing.id}`,
    });

    revalidatePath("/dashboard/organization/invitations");
    return result(true, "Invitation expiration extended.");
  } catch (error) {
    return result(false, formatError(error));
  }
}
