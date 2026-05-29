export type CreateRazorpaySubscriptionInput = {
  planId: string;
  totalCount: number;
  customerNotify?: boolean;
  notes?: Record<string, string>;
};

export type RazorpaySubscription = {
  id: string;
  entity: "subscription";
  plan_id: string;
  status: string;
  current_start: number | null;
  current_end: number | null;
  ended_at?: number | null;
  charge_at?: number | null;
  start_at?: number | null;
  end_at?: number | null;
  total_count?: number;
  paid_count?: number;
  customer_notify?: boolean;
  notes?: Record<string, string>;
  created_at?: number;
};

export type VerifyRazorpaySubscriptionCheckoutInput = {
  razorpayPaymentId: string;
  subscriptionId: string;
  razorpaySignature: string;
};

export type VerifyRazorpayWebhookInput = {
  body: string;
  signature: string;
};
