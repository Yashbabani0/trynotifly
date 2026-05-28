import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOnboardingState } from "@/lib/onboarding/service";
import { and, checkPlanLimit, count, db, emailDomain, eq, member, organization } from "@trynotifly/db";

export const runtime = "nodejs";

type DomainApiPayload =
  | {
      success: true;
      data: unknown;
    }
  | {
      success: false;
      error?: {
        code?: string;
        message?: string;
        details?: unknown;
      };
    };

function domainApiBaseUrl() {
  return process.env.DOMAIN_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3001";
}

function jsonError(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status },
  );
}

async function getOrganizationFromRequest(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  console.info("dashboard.domain.session", {
    authenticated: Boolean(session?.user),
    userId: session?.user?.id ?? null,
  });

  if (!session?.user) {
    return {
      error: jsonError(401, "UNAUTHORIZED", "Sign in before adding a domain."),
    };
  }

  const state = await getOnboardingState(session.user.id);

  console.info("dashboard.domain.organization", {
    userId: session.user.id,
    organizationId: state.organization?.id ?? null,
    onboardingCompleted: state.completed,
  });

  if (!state.organization) {
    return {
      error: jsonError(
        409,
        "ONBOARDING_REQUIRED",
        "Create your workspace before adding a sending domain.",
      ),
    };
  }

  const membership = await db.query.member.findFirst({
    where: and(eq(member.userId, session.user.id), eq(member.organizationId, state.organization.id)),
  });

  return {
    user: session.user,
    organizationId: state.organization.id,
    role: membership?.role?.toLowerCase() ?? "member",
  };
}

async function parseDomainApiResponse(response: Response) {
  const text = await response.text();
  let payload: DomainApiPayload | null = null;

  try {
    payload = text ? (JSON.parse(text) as DomainApiPayload) : null;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    const error = payload && !payload.success ? payload.error : undefined;

    return jsonError(
      response.status || 502,
      error?.code ?? "DOMAIN_API_FAILED",
      error?.message ?? "The domain service did not return a valid response.",
      {
        upstreamStatus: response.status,
        upstreamBody: payload ?? text,
        details: error?.details,
      },
    );
  }

  return NextResponse.json(payload, { status: response.status });
}

export async function POST(request: Request) {
  const context = await getOrganizationFromRequest(request);

  if ("error" in context) {
    return context.error;
  }

  if (!canManageDomains(context.role)) {
    return jsonError(403, "INSUFFICIENT_ROLE", "Only organization owners and admins can add domains.");
  }

  const body = (await request.json().catch(() => null)) as { domain?: string } | null;

  console.info("dashboard.domain.create.request", {
    userId: context.user.id,
    organizationId: context.organizationId,
    domain: body?.domain ?? null,
  });

  if (!body?.domain) {
    return jsonError(400, "DOMAIN_REQUIRED", "Enter a domain to continue.");
  }

  try {
    const org = await db.query.organization.findFirst({
      where: eq(organization.id, context.organizationId),
    });
    const [domainCount] = await db
      .select({ value: count() })
      .from(emailDomain)
      .where(eq(emailDomain.organizationId, context.organizationId));
    const limit = checkPlanLimit({
      plan: org?.plan,
      key: "domains",
      current: domainCount?.value ?? 0,
    });

    if (!limit.allowed) {
      return jsonError(402, limit.code, limit.message, limit);
    }

    const upstream = await fetch(`${domainApiBaseUrl()}/v1/domain/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-organization-id": context.organizationId,
      },
      body: JSON.stringify({
        domain: body.domain,
      }),
      cache: "no-store",
    });

    return parseDomainApiResponse(upstream);
  } catch (error) {
    console.error("dashboard.domain.create.upstream_failed", {
      organizationId: context.organizationId,
      error,
    });

    return jsonError(
      502,
      "DOMAIN_SERVICE_UNAVAILABLE",
      "The domain verification service is unavailable. Make sure the API server is running.",
      error instanceof Error ? { message: error.message } : undefined,
    );
  }
}

export async function GET(request: Request) {
  const context = await getOrganizationFromRequest(request);

  if ("error" in context) {
    return context.error;
  }

  try {
    const upstream = await fetch(`${domainApiBaseUrl()}/v1/domain/list`, {
      headers: {
        "x-organization-id": context.organizationId,
      },
      cache: "no-store",
    });

    return parseDomainApiResponse(upstream);
  } catch (error) {
    console.error("dashboard.domain.list.upstream_failed", {
      organizationId: context.organizationId,
      error,
    });

    return jsonError(
      502,
      "DOMAIN_SERVICE_UNAVAILABLE",
      "The domain verification service is unavailable. Make sure the API server is running.",
      error instanceof Error ? { message: error.message } : undefined,
    );
  }
}
function canManageDomains(role?: string | null) {
  return role === "owner" || role === "admin";
}
