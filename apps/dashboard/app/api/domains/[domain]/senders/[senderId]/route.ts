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
      { upstreamStatus: response.status, upstreamBody: payload ?? text, details: error?.details },
    );
  }

  return NextResponse.json(apiPayload, { status: response.status });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ domain: string; senderId: string }> },
) {
  const [context, routeParams, body] = await Promise.all([
    getDomainRouteContext(request),
    params,
    request.json().catch(() => null) as Promise<{ status?: string; isDefault?: boolean } | null>,
  ]);

  if ("error" in context) {
    return context.error;
  }

  const permissionError = requireDomainManager(context);

  if (permissionError) {
    return permissionError;
  }

  const upstream = await fetch(
    `${domainApiBaseUrl()}/v1/domain/${encodeURIComponent(routeParams.domain)}/senders/${encodeURIComponent(routeParams.senderId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-organization-id": context.organizationId,
      },
      body: JSON.stringify(body ?? {}),
      cache: "no-store",
    },
  );

  return parseUpstreamResponse(upstream);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ domain: string; senderId: string }> },
) {
  const [context, routeParams] = await Promise.all([getDomainRouteContext(request), params]);

  if ("error" in context) {
    return context.error;
  }

  const permissionError = requireDomainManager(context);

  if (permissionError) {
    return permissionError;
  }

  const upstream = await fetch(
    `${domainApiBaseUrl()}/v1/domain/${encodeURIComponent(routeParams.domain)}/senders/${encodeURIComponent(routeParams.senderId)}`,
    {
      method: "DELETE",
      headers: { "x-organization-id": context.organizationId },
      cache: "no-store",
    },
  );

  return parseUpstreamResponse(upstream);
}
