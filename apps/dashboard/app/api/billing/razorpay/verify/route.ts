import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "ONE_TIME_VERIFY_DISABLED",
        message:
          "Razorpay one-time payment verification has been replaced by subscription verification.",
      },
    },
    { status: 410 },
  );
}
