import { NextResponse } from "next/server";
import { and, db, eq, member } from "@trynotifly/db";
import { auth } from "@/lib/auth";
import { getOnboardingState } from "@/lib/onboarding/service";

export function domainJsonError(
  status: number,
  code: string,
  message: string,
  details?: unknown,
) {
  return NextResponse.json(
    { success: false, error: { code, message, details } },
    { status },
  );
}

export async function getDomainRouteContext(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return {
      error: domainJsonError(401, "UNAUTHORIZED", "Sign in before managing domains."),
    };
  }

  const state = await getOnboardingState(session.user.id);

  if (!state.organization) {
    return {
      error: domainJsonError(
        409,
        "ONBOARDING_REQUIRED",
        "Create your workspace before managing sending domains.",
      ),
    };
  }

  const membership = await db.query.member.findFirst({
    where: and(
      eq(member.userId, session.user.id),
      eq(member.organizationId, state.organization.id),
    ),
  });

  return {
    user: session.user,
    organizationId: state.organization.id,
    role: membership?.role?.toLowerCase() ?? "member",
  };
}

export function requireDomainManager(context: { role: string }) {
  if (context.role !== "owner" && context.role !== "admin") {
    return domainJsonError(
      403,
      "INSUFFICIENT_ROLE",
      "Only organization owners and admins can manage domains.",
    );
  }

  return null;
}
