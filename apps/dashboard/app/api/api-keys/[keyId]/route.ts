import { NextResponse } from "next/server";
import { ApiKeyError, publicApiKey, revokeOrganizationApiKey } from "@/lib/api-keys";
import { auth } from "@/lib/auth";
import { getOnboardingState } from "@/lib/onboarding/service";

export const runtime = "nodejs";

function jsonError(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json(
    { success: false, error: { code, message, details } },
    { status },
  );
}

function sendError(error: unknown) {
  if (error instanceof ApiKeyError) {
    return jsonError(error.statusCode, error.code, error.message, error.details);
  }

  console.error("api_keys.revoke.failed", { error });

  return jsonError(500, "API_KEY_INTERNAL_ERROR", "API key request failed unexpectedly.");
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ keyId: string }> },
) {
  const [session, routeParams] = await Promise.all([
    auth.api.getSession({ headers: request.headers }),
    params,
  ]);

  if (!session?.user) {
    return jsonError(401, "UNAUTHORIZED", "Sign in before revoking API keys.");
  }

  const state = await getOnboardingState(session.user.id);

  if (!state.organization) {
    return jsonError(409, "ORGANIZATION_NOT_FOUND", "Create your workspace before revoking API keys.");
  }

  try {
    const revoked = await revokeOrganizationApiKey({
      organizationId: state.organization.id,
      userId: session.user.id,
      keyId: routeParams.keyId,
    });

    return NextResponse.json({
      success: true,
      data: {
        apiKey: revoked ? publicApiKey(revoked) : null,
      },
    });
  } catch (error) {
    return sendError(error);
  }
}
