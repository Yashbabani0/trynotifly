import { NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/api-keys";

export const runtime = "nodejs";

export async function PUT(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as { rawKey?: string } | null;
    const rawKey = body?.rawKey;

    if (!rawKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid API key.",
        },
        { status: 401 },
      );
    }

    const verified = await verifyApiKey(rawKey);

    if (!verified) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid API key.",
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "API key verified.",
      organizationId: verified.organizationId,
      type: verified.type,
    });
  } catch (error) {
    console.error("api_key.verify.failed", { error });

    return NextResponse.json(
      {
        success: false,
        message: "Verification failed.",
      },
      { status: 500 },
    );
  }
}
