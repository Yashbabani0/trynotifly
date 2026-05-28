import { NextResponse } from "next/server";
import {
  ApiKeyError,
  createOrganizationApiKey,
  listOrganizationApiKeys,
  publicApiKey,
} from "@/lib/api-keys";
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

  console.error("api_keys.route.failed", { error });

  return jsonError(500, "API_KEY_INTERNAL_ERROR", "API key request failed unexpectedly.");
}

async function getContext(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return {
      error: jsonError(401, "UNAUTHORIZED", "Sign in before managing API keys."),
    };
  }

  const state = await getOnboardingState(session.user.id);

  if (!state.organization) {
    return {
      error: jsonError(409, "ORGANIZATION_NOT_FOUND", "Create your workspace before managing API keys."),
    };
  }

  return {
    userId: session.user.id,
    organizationId: state.organization.id,
  };
}

export async function GET(request: Request) {
  const context = await getContext(request);

  if ("error" in context) {
    return context.error;
  }

  try {
    const keys = await listOrganizationApiKeys(context);

    return NextResponse.json({
      success: true,
      data: {
        apiKeys: keys.map(publicApiKey),
      },
    });
  } catch (error) {
    return sendError(error);
  }
}

export async function POST(request: Request) {
  const context = await getContext(request);

  if ("error" in context) {
    return context.error;
  }

  try {
    const body = (await request.json().catch(() => null)) as {
      name?: string;
      type?: "LIVE" | "TEST";
    } | null;
    const result = await createOrganizationApiKey({
      organizationId: context.organizationId,
      userId: context.userId,
      name: body?.name ?? "",
      type: body?.type ?? "TEST",
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          apiKey: publicApiKey(result.apiKey),
          rawKey: result.rawKey,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return sendError(error);
  }
}
