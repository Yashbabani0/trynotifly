import { and, apiKey, db, eq } from "@trynotifly/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const rawKey = body.rawKey as string;

    const prefix = rawKey.split("_").slice(0, 3).join("_");

    const encoder = new TextEncoder();

    const data = encoder.encode(rawKey);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    const hashedIncomingKey = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const foundKey = await db.query.apiKey.findFirst({
      where: and(
        eq(apiKey.prefix, prefix),
        eq(apiKey.hashedKey, hashedIncomingKey),
        eq(apiKey.status, "ACTIVE"),
      ),
    });

    if (!foundKey) {
      return NextResponse.json({
        success: false,
        message: "Invalid API Key",
      });
    }

    return NextResponse.json({
      success: true,
      message: "API Key Verified",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Verification failed",
      },
      {
        status: 500,
      },
    );
  }
}
