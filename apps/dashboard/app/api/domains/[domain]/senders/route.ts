import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOnboardingState } from "@/lib/onboarding/service";
import {
  checkPlanLimit,
  and,
  count,
  db,
  eq,
  member,
  organization,
  senderEmailIdentity,
} from "@trynotifly/db";

export const runtime = "nodejs";

function domainApiBaseUrl() {
  return process.env.DOMAIN_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3001";
}

function jsonError(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json(
    { success: false, error: { code, message, details } },
    { status },
  );
}

async function parseUpstreamResponse(response: Response) {
  const text = await response.text();
  let payload: unknown = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  const apiPayload = payload as
    | { success?: true; data?: unknown }
    | { success?: false; error?: { code?: string; message?: string; details?: unknown } }
    | null;

  if (!response.ok || !apiPayload?.success) {
    const error = apiPayload && "error" in apiPayload ? apiPayload.error : undefined;

    return jsonError(
      response.status || 502,
      error?.code ?? "DOMAIN_API_FAILED",
      error?.message ?? "The domain service did not return a valid response.",
      { upstreamStatus: response.status, upstreamBody: payload ?? text, details: error?.details },
    );
  }

  return NextResponse.json(apiPayload, { status: response.status });
}

async function getOrganizationContext(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return {
      error: jsonError(401, "UNAUTHORIZED", "Sign in before managing sender emails."),
    };
  }

  const state = await getOnboardingState(session.user.id);

  if (!state.organization) {
    return {
      error: jsonError(
        409,
        "ONBOARDING_REQUIRED",
        "Create your workspace before managing sender emails.",
      ),
    };
  }

  return {
    user: session.user,
    organizationId: state.organization.id,
    role:
      (
        await db.query.member.findFirst({
          where: and(
            eq(member.userId, session.user.id),
            eq(member.organizationId, state.organization.id),
          ),
        })
      )?.role?.toLowerCase() ?? "member",
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ domain: string }> },
) {
  const [context, routeParams] = await Promise.all([getOrganizationContext(request), params]);

  if ("error" in context) {
    return context.error;
  }

  const upstream = await fetch(
    `${domainApiBaseUrl()}/v1/domain/${encodeURIComponent(routeParams.domain)}/senders`,
    {
      headers: { "x-organization-id": context.organizationId },
      cache: "no-store",
    },
  );

  return parseUpstreamResponse(upstream);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ domain: string }> },
) {
  const [context, routeParams] = await Promise.all([getOrganizationContext(request), params]);

  if ("error" in context) {
    return context.error;
  }

  const body = (await request.json().catch(() => null)) as {
    email?: string;
    displayName?: string | null;
    isDefault?: boolean;
  } | null;

  if (!body?.email) {
    return jsonError(400, "SENDER_EMAIL_REQUIRED", "Enter a sender email address.");
  }

  if (context.role !== "owner" && context.role !== "admin") {
    return jsonError(403, "INSUFFICIENT_ROLE", "Only organization owners and admins can manage sender emails.");
  }

  const org = await db.query.organization.findFirst({
    where: eq(organization.id, context.organizationId),
  });
  const [senderCount] = await db
    .select({ value: count() })
    .from(senderEmailIdentity)
    .where(eq(senderEmailIdentity.organizationId, context.organizationId));
  const limit = checkPlanLimit({
    plan: org?.plan,
    key: "senderEmails",
    current: senderCount?.value ?? 0,
  });

  if (!limit.allowed) {
    return jsonError(402, limit.code, limit.message, limit);
  }

  const upstream = await fetch(
    `${domainApiBaseUrl()}/v1/domain/${encodeURIComponent(routeParams.domain)}/senders`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-organization-id": context.organizationId,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );

  return parseUpstreamResponse(upstream);
}
