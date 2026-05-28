import { NextResponse } from "next/server";
import {
  domainJsonError as jsonError,
  getDomainRouteContext,
  requireDomainManager,
} from "@/lib/domain-route-context";

export const runtime = "nodejs";

function domainApiBaseUrl() {
  return process.env.DOMAIN_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3001";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ domain: string }> },
) {
  const [session, routeParams] = await Promise.all([
    getDomainRouteContext(request),
    params,
  ]);

  if ("error" in session) {
    return session.error;
  }

  const permissionError = requireDomainManager(session);

  if (permissionError) {
    return permissionError;
  }

  console.info("dashboard.domain.check.request", {
    userId: session.user.id,
    organizationId: session.organizationId,
    domain: routeParams.domain,
  });

  try {
    const upstream = await fetch(
      `${domainApiBaseUrl()}/v1/domain/check/${encodeURIComponent(routeParams.domain)}`,
      {
        method: "POST",
        headers: {
          "x-organization-id": session.organizationId,
        },
        cache: "no-store",
      },
    );
    const text = await upstream.text();
    const payload = text ? JSON.parse(text) : null;

    if (!upstream.ok || !payload?.success) {
      return jsonError(
        upstream.status || 502,
        payload?.error?.code ?? "DOMAIN_API_FAILED",
        payload?.error?.message ?? "The domain service did not return a valid response.",
        {
          upstreamStatus: upstream.status,
          upstreamBody: payload ?? text,
        },
      );
    }

    return NextResponse.json(payload, { status: upstream.status });
  } catch (error) {
    console.error("dashboard.domain.check.upstream_failed", {
      organizationId: session.organizationId,
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
