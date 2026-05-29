"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type RazorpaySubscriptionCheckoutResponse = {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
};

type RazorpayFailedResponse = {
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
  };
};

type RazorpayOptions = {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
  };
  notes?: Record<string, string>;
  modal?: {
    ondismiss?: () => void | Promise<void>;
  };
  handler: (
    response: RazorpaySubscriptionCheckoutResponse,
  ) => void | Promise<void>;
  theme?: {
    color?: string;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (
    event: "payment.failed",
    handler: (response: RazorpayFailedResponse) => void,
  ) => void;
};

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

type Props = {
  organizationId: string;
  planSlug: string;
  planName: string;
  label?: string;
  userName?: string | null;
  userEmail?: string | null;
};

type SubscriptionResponse =
  | {
      success: true;
      data: {
        subscriptionId: string;
        razorpayKeyId: string;
        planName: string;
        amount: number;
        currency: string;
        retryable?: boolean;
        reusedExistingSubscription?: boolean;
      };
    }
  | {
      success: false;
      error?: {
        code?: string;
        message?: string;
        details?: {
          currentPeriodEnd?: string | null;
          cancelAtPeriodEnd?: boolean;
        };
      };
    };

export function RazorpayCheckoutButton({
  organizationId,
  planSlug,
  planName,
  label = "Subscribe with Razorpay",
  userName,
  userEmail,
}: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [canCancelCurrent, setCanCancelCurrent] = useState(false);

  async function cancelCurrentSubscription() {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/billing/razorpay/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ organizationId }),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        data?: {
          currentPeriodEnd?: string | null;
        };
        error?: {
          message?: string;
        };
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message ?? "Could not schedule cancellation.");
      }

      const until = payload.data?.currentPeriodEnd
        ? new Date(payload.data.currentPeriodEnd).toLocaleDateString()
        : "the end of your current period";

      setMessage(`Cancellation scheduled. Your current plan stays active until ${until}.`);
      setCanCancelCurrent(false);
    } catch (cause) {
      setMessage(
        cause instanceof Error
          ? cause.message
          : "Could not schedule subscription cancellation.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function clearPendingSubscription() {
    const response = await fetch(
      "/api/billing/razorpay/clear-pending-subscription",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ organizationId }),
      },
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;

      throw new Error(
        payload?.error?.message ?? "Could not clear pending checkout.",
      );
    }
  }

  async function handlePay() {
    setIsLoading(true);
    setMessage(null);
    setCanCancelCurrent(false);

    if (!window.Razorpay) {
      setMessage("Razorpay checkout could not be loaded. Please try again.");
      window.location.href = "/dashboard/billing/failed";
      return;
    }

    try {
      const response = await fetch("/api/billing/razorpay/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId,
          planSlug,
        }),
      });
      const payload = (await response.json()) as SubscriptionResponse;

      if (!response.ok || !payload.success) {
        const code = payload.success ? undefined : payload.error?.code;

        if (code === "CANCEL_CURRENT_SUBSCRIPTION_FIRST") {
          setCanCancelCurrent(true);
        }

        throw new Error(
          payload.success
            ? "Could not create subscription."
            : payload.error?.message ?? "Could not create subscription.",
        );
      }

      const subscriptionId = payload.data.subscriptionId;
      let checkoutCompleted = false;
      const checkout = new window.Razorpay({
        key: payload.data.razorpayKeyId,
        subscription_id: subscriptionId,
        name: "TryNotifly",
        description: `${payload.data.planName || planName} plan`,
        prefill: {
          name: userName ?? undefined,
          email: userEmail ?? undefined,
        },
        notes: {
          organizationId,
          planSlug,
        },
        modal: {
          ondismiss: () => {
            if (checkoutCompleted) {
              return;
            }

            setMessage("Payment was cancelled. You can retry anytime.");
            setIsLoading(false);
            router.refresh();
          },
        },
        handler: async (checkoutResponse) => {
          checkoutCompleted = true;
          const verifyResponse = await fetch(
            "/api/billing/razorpay/verify-subscription-payment",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                organizationId,
                subscriptionId,
                ...checkoutResponse,
              }),
            },
          );

          if (verifyResponse.ok) {
            window.location.href = "/dashboard/billing/success";
            return;
          }

          setMessage("Payment authentication failed. You can retry anytime.");
          router.refresh();
        },
        theme: {
          color: "#000000",
        },
      });

      checkout.on("payment.failed", async () => {
        try {
          await clearPendingSubscription();
        } catch {
          // Keep the user retryable even if clearing the local pending row fails.
        }

        setMessage("Payment failed. You can retry anytime.");
        setIsLoading(false);
        router.refresh();
      });

      checkout.open();
      setMessage("Subscription created. Complete authentication in Razorpay Checkout.");
    } catch (cause) {
      setMessage(
        cause instanceof Error
          ? cause.message
          : "Could not start Razorpay subscription checkout.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" onClick={handlePay} disabled={isLoading}>
        {isLoading ? "Loading checkout..." : label}
      </Button>
      {canCancelCurrent ? (
        <Button
          className="w-full"
          onClick={cancelCurrentSubscription}
          disabled={isLoading}
          variant="outline"
        >
          Cancel current plan first
        </Button>
      ) : null}
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}

export function CancelSubscriptionButton({
  organizationId,
}: {
  organizationId: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function cancelCurrentSubscription() {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/billing/razorpay/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ organizationId }),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        data?: {
          currentPeriodEnd?: string | null;
        };
        error?: {
          message?: string;
        };
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message ?? "Could not schedule cancellation.");
      }

      const until = payload.data?.currentPeriodEnd
        ? new Date(payload.data.currentPeriodEnd).toLocaleDateString()
        : "the end of your current period";

      setMessage(`Cancellation scheduled. Your current plan stays active until ${until}.`);
    } catch (cause) {
      setMessage(
        cause instanceof Error
          ? cause.message
          : "Could not schedule subscription cancellation.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        className="w-full"
        onClick={cancelCurrentSubscription}
        disabled={isLoading}
        variant="outline"
      >
        {isLoading ? "Scheduling cancellation..." : "Cancel at period end"}
      </Button>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}

export function ClearPendingSubscriptionButton({
  organizationId,
}: {
  organizationId: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function clearPendingSubscription() {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(
        "/api/billing/razorpay/clear-pending-subscription",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ organizationId }),
        },
      );
      const payload = (await response.json().catch(() => null)) as {
        success?: boolean;
        error?: {
          message?: string;
        };
      } | null;

      if (!response.ok || !payload?.success) {
        throw new Error(
          payload?.error?.message ?? "Could not clear pending checkout.",
        );
      }

      setMessage("Pending payment cleared.");
      router.refresh();
    } catch (cause) {
      setMessage(
        cause instanceof Error
          ? cause.message
          : "Could not clear pending checkout.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        className="w-full"
        onClick={clearPendingSubscription}
        disabled={isLoading}
        variant="outline"
      >
        {isLoading ? "Clearing..." : "Clear pending payment"}
      </Button>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
