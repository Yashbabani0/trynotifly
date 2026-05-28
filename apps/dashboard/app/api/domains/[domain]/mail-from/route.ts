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

export async function PATCH(
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

  const body = (await request.json().catch(() => null)) as { mailFromDomain?: string } | null;

  if (!body?.mailFromDomain) {
    return jsonError(400, "MAIL_FROM_REQUIRED", "Enter a MAIL FROM subdomain.");
  }

  console.info("dashboard.domain.mail_from.request", {
    userId: context.user.id,
    organizationId: context.organizationId,
    domain: routeParams.domain,
    mailFromDomain: body.mailFromDomain,
  });

  try {
    const upstream = await fetch(
      `${domainApiBaseUrl()}/v1/domain/${encodeURIComponent(routeParams.domain)}/mail-from`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": context.organizationId,
        },
        body: JSON.stringify({
          mailFromDomain: body.mailFromDomain,
        }),
        cache: "no-store",
      },
    );

    return parseUpstreamResponse(upstream);
  } catch (error) {
    console.error("dashboard.domain.mail_from.upstream_failed", {
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
