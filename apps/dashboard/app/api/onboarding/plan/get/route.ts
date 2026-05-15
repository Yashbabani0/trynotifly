import { NextResponse } from "next/server";
import { db, plan, eq, asc } from "@trynotifly/db";

export async function GET() {
  try {
    const plans = await db.query.plan.findMany({
      where: eq(plan.isActive, true),

      orderBy: asc(plan.sortOrder),
    });

    return NextResponse.json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to fetch plans",
      },
      { status: 500 },
    );
  }
}
