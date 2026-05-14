"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import { Lock, Mail } from "lucide-react";

import { authClient } from "@/lib/auth/auth-client";
import {
  AuthBottomLink,
  AuthDivider,
  AuthErrorBlock,
  AuthHeader,
  AuthInput,
  AuthShell,
  AuthSubmitButton,
  FieldShell,
  OAuthGroup,
  type OAuthProvider,
  PasswordToggle,
} from "@/components/auth";

const signInSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError("");

    const validatedFields = signInSchema.safeParse({ email, password });

    if (!validatedFields.success) {
      const firstError =
        validatedFields.error.issues[0]?.message || "Invalid form data";
      setError(firstError);
      toast.error(firstError);
      return;
    }

    setLoading(true);
    try {
      await authClient.signIn.email(
        { email, password },
        {
          onSuccess: () => {
            toast.success("Signed in successfully");
            router.push("/dashboard");
          },
          onError: (ctx) => {
            setError(ctx.error.message);
            toast.error(ctx.error.message);
          },
        },
      );
    } catch {
      toast.error("An error occurred while signing in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithProvider(provider: OAuthProvider) {
    if (oauthLoading) return;
    setOauthLoading(provider);
    try {
      await authClient.signIn.social({ provider, callbackURL: "/dashboard" });
    } catch {
      toast.error(
        `An error occurred while signing in with ${provider}. Please try again.`,
      );
    } finally {
      setOauthLoading(null);
    }
  }

  const isBusy = loading || oauthLoading !== null;

  return (
    <AuthShell>
      <AuthHeader
        eyebrow="02 · Sign in"
        title="Welcome back"
        description="Sign in to your TryNotifly account to continue."
      />

      <OAuthGroup
        loadingProvider={oauthLoading}
        disabled={isBusy}
        onSelect={signInWithProvider}
      />

      <AuthDivider />

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FieldShell htmlFor="email" label="Work email">
          <AuthInput
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isBusy}
            icon={<Mail className="size-4" strokeWidth={2} />}
          />
        </FieldShell>

        <FieldShell
          htmlFor="password"
          label="Password"
          hint={
            <Link
              href="/forgot-password"
              className="text-[11.5px] font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Forgot password?
            </Link>
          }
        >
          <AuthInput
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isBusy}
            icon={<Lock className="size-4" strokeWidth={2} />}
            trailing={
              <PasswordToggle
                visible={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
              />
            }
          />
        </FieldShell>

        <AuthErrorBlock error={error} />

        <AuthSubmitButton
          loading={loading}
          loadingLabel="Signing in…"
          disabled={isBusy}
        >
          Sign in
        </AuthSubmitButton>
      </form>

      <AuthBottomLink
        prompt="Don't have an account?"
        href="/signup"
        cta="Create one"
      />
    </AuthShell>
  );
}
