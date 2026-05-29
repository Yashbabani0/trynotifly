import "dotenv/config";
import crypto from "crypto";
import Razorpay from "razorpay";
import type {
  CreateRazorpaySubscriptionInput,
  RazorpaySubscription,
  VerifyRazorpaySubscriptionCheckoutInput,
  VerifyRazorpayWebhookInput,
} from "./types";

type RazorpaySubscriptionsClient = {
  subscriptions: {
    create: (input: {
      plan_id: string;
      total_count: number;
      customer_notify: 0 | 1;
      notes?: Record<string, string>;
    }) => Promise<RazorpaySubscription>;
    fetch: (subscriptionId: string) => Promise<RazorpaySubscription>;
  };
};

function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET");
  }

  return {
    keyId,
    keySecret,
  };
}

function getRazorpayInstance() {
  const { keyId, keySecret } = getRazorpayCredentials();

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  }) as Razorpay & RazorpaySubscriptionsClient;
}

function timingSafeEqualHex(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");

  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function hmacSha256Hex(body: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

export async function createRazorpaySubscription(
  input: CreateRazorpaySubscriptionInput,
) {
  const razorpay = getRazorpayInstance();

  return razorpay.subscriptions.create({
    plan_id: input.planId,
    total_count: input.totalCount,
    customer_notify: input.customerNotify === false ? 0 : 1,
    notes: input.notes,
  });
}

export async function fetchRazorpaySubscription(subscriptionId: string) {
  const razorpay = getRazorpayInstance();

  return razorpay.subscriptions.fetch(subscriptionId);
}

export async function cancelRazorpaySubscriptionAtCycleEnd(
  subscriptionId: string,
) {
  const { keyId, keySecret } = getRazorpayCredentials();
  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch(
    `https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cancel_at_cycle_end: 1,
      }),
    },
  );

  const payload = (await response.json().catch(() => null)) as
    | RazorpaySubscription
    | { error?: { description?: string } }
    | null;

  if (!response.ok) {
    const message =
      payload && "error" in payload
        ? payload.error?.description
        : "Could not schedule Razorpay subscription cancellation.";

    throw new Error(message);
  }

  return payload as RazorpaySubscription;
}

export function verifyRazorpaySubscriptionCheckoutSignature(
  input: VerifyRazorpaySubscriptionCheckoutInput,
) {
  const { keySecret } = getRazorpayCredentials();
  const body = `${input.razorpayPaymentId}|${input.subscriptionId}`;
  const expectedSignature = hmacSha256Hex(body, keySecret);

  return timingSafeEqualHex(expectedSignature, input.razorpaySignature);
}

export function verifyRazorpayWebhookSignature(
  input: VerifyRazorpayWebhookInput,
) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("Missing RAZORPAY_WEBHOOK_SECRET");
  }

  const expectedSignature = hmacSha256Hex(input.body, webhookSecret);

  return timingSafeEqualHex(expectedSignature, input.signature);
}

export function getRazorpayKeyId() {
  const { keyId } = getRazorpayCredentials();

  return keyId;
}
