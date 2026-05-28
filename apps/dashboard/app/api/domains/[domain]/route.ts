import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOnboardingState } from "@/lib/onboarding/service";
import {
  getDomainRouteContext,
  requireDomainManager,
} from "@/lib/domain-route-context";

export const runtime = "nodejs";

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
      {
        upstreamStatus: response.status,
        upstreamBody: payload ?? text,
        details: error?.details,
      },
    );
  }

  return NextResponse.json(apiPayload, { status: response.status });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ domain: string }> },
) {
  const [context, routeParams] = await Promise.all([
    getDomainRouteContext(request),
    params,
  ]);

  if ("error" in context) {
    return context.error;
  }

  const permissionError = requireDomainManager(context);

  if (permissionError) {
    return permissionError;
  }

  console.info("dashboard.domain.delete.request", {
    userId: context.user.id,
    organizationId: context.organizationId,
    domain: routeParams.domain,
  });

  try {
    const upstream = await fetch(
      `${domainApiBaseUrl()}/v1/domain/${encodeURIComponent(routeParams.domain)}`,
      {
        method: "DELETE",
        headers: {
          "x-organization-id": context.organizationId,
        },
        cache: "no-store",
      },
    );

    return parseUpstreamResponse(upstream);
  } catch (error) {
    console.error("dashboard.domain.delete.upstream_failed", {
      organizationId: context.organizationId,
      domain: routeParams.domain,
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ domain: string }> },
) {
  const [session, routeParams] = await Promise.all([
    auth.api.getSession({ headers: request.headers }),
    params,
  ]);

  if (!session?.user) {
    return jsonError(401, "UNAUTHORIZED", "Sign in before viewing a domain.");
  }

  const state = await getOnboardingState(session.user.id);

  if (!state.organization) {
    return jsonError(
      409,
      "ONBOARDING_REQUIRED",
      "Create your workspace before viewing a sending domain.",
    );
  }

  console.info("dashboard.domain.details.request", {
    userId: session.user.id,
    organizationId: state.organization.id,
    domain: routeParams.domain,
  });

  try {
    const upstream = await fetch(
      `${domainApiBaseUrl()}/v1/domain/${encodeURIComponent(routeParams.domain)}`,
      {
        headers: {
          "x-organization-id": state.organization.id,
        },
        cache: "no-store",
      },
    );

    return parseUpstreamResponse(upstream);
  } catch (error) {
    console.error("dashboard.domain.details.upstream_failed", {
      organizationId: state.organization.id,
      domain: routeParams.domain,
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
