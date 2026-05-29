import { NextResponse } from "next/server";
import {
  cleanupAbandonedCreatedSubscriptions,
  expireScheduledCancellations,
  resetDueFreeCredits,
  resetDuePaidCredits,
} from "@/lib/billing";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return true;
  }

  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }

  const abandonedSubscriptions = await cleanupAbandonedCreatedSubscriptions();
  const expiredCancellations = await expireScheduledCancellations();
  const freeCreditResets = await resetDueFreeCredits();
  const paidCreditResets = await resetDuePaidCredits();

  return NextResponse.json({
    success: true,
    data: {
      abandonedSubscriptions,
      expiredCancellations,
      freeCreditResets,
      paidCreditResets,
    },
  });
}

export const POST = GET;
