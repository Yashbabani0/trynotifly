import { db } from "@trynotifly/db";
import { apiKey } from "@trynotifly/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const type = body.type as "LIVE" | "TEST";

    const keyPrefix =
      type === "LIVE"
        ? `tn_live_${crypto.randomUUID().slice(0, 8)}`
        : `tn_test_${crypto.randomUUID().slice(0, 8)}`;

    const secret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const rawKey = `${keyPrefix}_${secret}`;

    const encoder = new TextEncoder();

    const data = encoder.encode(rawKey);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    const hashedKey = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    await db.insert(apiKey).values({
      name: `${type} Key`,
      type,
      hashedKey,
      prefix: keyPrefix,
      organizationId: "b7e67033-8f64-450f-b535-82342bfd508a",
    });

    return NextResponse.json({
      success: true,
      key: rawKey,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create API key",
      },
      {
        status: 500,
      },
    );
  }
}
