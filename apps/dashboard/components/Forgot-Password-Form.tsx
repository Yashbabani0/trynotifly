"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import { Mail } from "lucide-react";

import { authClient } from "@/lib/auth/auth-client";
import {
  AuthErrorBlock,
  AuthHeader,
  AuthInput,
  AuthLeftPanel,
  AuthShell,
  AuthSubmitButton,
  FieldShell,
  Highlight,
  MobileTopRightLink,
  RecoveryStepsCard,
  TopRightLink,
} from "@/components/auth";

const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError("");

    const validatedFields = forgotPasswordSchema.safeParse({ email });

    if (!validatedFields.success) {
      const firstError =
        validatedFields.error.issues[0]?.message || "Invalid form data";
      setError(firstError);
      toast.error(firstError);
      return;
    }

    setLoading(true);
    try {
      await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });
      setSent(true);
      toast.success(
        "If an account exists for this email, a password reset link has been sent.",
      );
    } catch {
      toast.error("Failed to send password reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      leftPanel={
        <AuthLeftPanel
          tag="account recovery"
          headline={
            <>
              Locked out?
              <br />
              We&apos;ll <Highlight>get you back in</Highlight>.
            </>
          }
          description="Reset links are signed, single-use, and time-boxed. We never store recoverable passwords — only argon2id hashes."
          supportCard={<RecoveryStepsCard />}
        />
      }
      topRight={
        <TopRightLink
          prompt="Remembered it?"
          href="/signin"
          cta="Back to sign in"
        />
      }
      mobileTopRight={<MobileTopRightLink href="/signin" label="Sign in" />}
    >
      <AuthHeader
        eyebrow="03 · Recover access"
        title="Reset your password"
        description={
          sent
            ? "Check your inbox — if the address is on file, a reset link is on its way."
            : "Enter the email tied to your TryNotifly account and we'll send a signed reset link."
        }
      />

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <FieldShell htmlFor="email" label="Work email">
          <AuthInput
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            icon={<Mail className="size-3.5" strokeWidth={2} />}
          />
        </FieldShell>

        <AuthErrorBlock error={error} />

        <AuthSubmitButton
          loading={loading}
          loadingLabel="Sending reset link…"
          disabled={loading}
        >
          {sent ? "Resend reset link" : "Send reset link"}
        </AuthSubmitButton>

        <p className="text-center text-[11px] leading-relaxed text-muted-foreground lg:hidden">
          Remembered it?{" "}
          <Link
            href="/signin"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
