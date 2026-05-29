import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "ONE_TIME_CHECKOUT_DISABLED",
        message: "Razorpay one-time checkout has been replaced by subscriptions.",
      },
    },
    { status: 410 },
  );
}
