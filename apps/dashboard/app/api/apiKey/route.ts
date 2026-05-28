import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "API_KEY_ROUTE_DEPRECATED",
        message: "Use /api/api-keys from the authenticated dashboard API key page.",
      },
    },
    { status: 410 },
  );
}
