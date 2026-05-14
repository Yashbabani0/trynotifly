"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import { Lock } from "lucide-react";

import { authClient } from "@/lib/auth/auth-client";
import { passwordSchema } from "@/lib/auth/password-validations";
import { cn } from "@/lib/utils";
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
  PasswordChecklist,
  PasswordToggle,
  SecurityCard,
  TopRightLink,
  getPasswordRuleStates,
} from "@/components/auth";

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordRules = useMemo(
    () => getPasswordRuleStates(password),
    [password],
  );
  const allRulesMet = passwordRules.every((r) => r.met);
  const passwordsMatch =
    confirmPassword.length > 0 && confirmPassword === password;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    if (!token) {
      toast.error("Invalid or expired reset token.");
      return;
    }

    setError("");

    const validatedFields = resetPasswordSchema.safeParse({
      password,
      confirmPassword,
    });

    if (!validatedFields.success) {
      const firstError =
        validatedFields.error.issues[0]?.message || "Invalid form data";
      setError(firstError);
      toast.error(firstError);
      return;
    }

    setLoading(true);
    try {
      await authClient.resetPassword({ newPassword: password, token });
      toast.success("Password reset successfully. Please sign in.");
      router.replace("/signin");
    } catch {
      toast.error(
        "Failed to reset password. The link may be invalid or expired.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      leftPanel={
        <AuthLeftPanel
          tag="credential rotation"
          headline={
            <>
              Set a new password.
              <br />
              <Highlight>Sign back in</Highlight> in seconds.
            </>
          }
          description="Your old credential is invalidated the moment you confirm. All other active sessions are signed out automatically."
          supportCard={<SecurityCard />}
        />
      }
      topRight={
        <TopRightLink prompt="All good?" href="/signin" cta="Back to sign in" />
      }
      mobileTopRight={<MobileTopRightLink href="/signin" label="Sign in" />}
    >
      <AuthHeader
        eyebrow="04 · New password"
        title="Choose a new password"
        description={
          token
            ? "Pick something memorable — we'll sign all your other sessions out for safety."
            : "This link is missing a token. Request a fresh one from the sign-in page."
        }
      />

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <FieldShell
          htmlFor="password"
          label="New password"
          hint={
            password.length > 0 ? (
              <span
                className={cn(
                  "font-mono text-[10px] tracking-[0.14em] uppercase transition-colors",
                  allRulesMet ? "text-primary" : "text-muted-foreground",
                )}
              >
                {allRulesMet ? "strong" : "weak"}
              </span>
            ) : null
          }
        >
          <AuthInput
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            disabled={loading || !token}
            icon={<Lock className="size-3.5" strokeWidth={2} />}
            trailing={
              <PasswordToggle
                visible={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
              />
            }
          />
          <PasswordChecklist
            value={password}
            visible={passwordFocused || password.length > 0}
          />
        </FieldShell>

        <FieldShell
          htmlFor="confirmPassword"
          label="Confirm password"
          hint={
            confirmPassword.length > 0 ? (
              <span
                className={cn(
                  "font-mono text-[10px] tracking-[0.14em] uppercase transition-colors",
                  passwordsMatch ? "text-primary" : "text-destructive/80",
                )}
              >
                {passwordsMatch ? "match" : "mismatch"}
              </span>
            ) : null
          }
        >
          <AuthInput
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading || !token}
            icon={<Lock className="size-3.5" strokeWidth={2} />}
            trailing={
              <PasswordToggle
                visible={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
              />
            }
          />
        </FieldShell>

        <AuthErrorBlock error={error} />

        <AuthSubmitButton
          loading={loading}
          loadingLabel="Resetting password…"
          disabled={loading || !token}
        >
          Reset password
        </AuthSubmitButton>

        <p className="text-center text-[11px] leading-relaxed text-muted-foreground lg:hidden">
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
