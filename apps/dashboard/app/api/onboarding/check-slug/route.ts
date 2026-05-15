import { NextRequest, NextResponse } from "next/server";
import { db, organization, eq } from "@trynotifly/db";

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        {
          available: false,
          message: "Slug is required",
        },
        { status: 400 },
      );
    }
    if (!slug || slug.length < 2) {
      return NextResponse.json({
        available: false,
        message: "Slug is too short",
      });
    }

    const existingOrganization = await db.query.organization.findFirst({
      where: eq(organization.slug, slug),
    });

    return NextResponse.json({
      available: !existingOrganization,
    });
  } catch {
    return NextResponse.json(
      {
        available: false,
        message: "Failed to check slug",
      },
      { status: 500 },
    );
  }
}
