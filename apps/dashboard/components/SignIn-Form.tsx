"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import { Lock, Mail } from "lucide-react";

import { authClient } from "@/lib/auth/auth-client";
import {
  AuthDivider,
  AuthErrorBlock,
  AuthHeader,
  AuthInput,
  AuthLeftPanel,
  AuthShell,
  AuthSubmitButton,
  FieldShell,
  Highlight,
  MobileTopRightLink,
  OAuthGroup,
  type OAuthProvider,
  PasswordToggle,
  SessionStatsCard,
  TopRightLink,
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
    <AuthShell
      leftPanel={
        <AuthLeftPanel
          tag="uptime · 99.99%"
          headline={
            <>
              Welcome back.
              <br />
              Your stack is <Highlight>still humming</Highlight>.
            </>
          }
          description="Pick up where you left off — drill into traces, replay failed webhooks, and roll out new channels without touching deliverability code."
          supportCard={<SessionStatsCard />}
        />
      }
      topRight={
        <TopRightLink
          prompt="New to TryNotifly?"
          href="/signup"
          cta="Create account"
        />
      }
      mobileTopRight={<MobileTopRightLink href="/signup" label="Sign up" />}
    >
      <AuthHeader
        eyebrow="02 · Sign in"
        title="Welcome back to TryNotifly"
        description="Sign in to continue to your dashboard."
      />

      <OAuthGroup
        loadingProvider={oauthLoading}
        disabled={isBusy}
        onSelect={signInWithProvider}
      />

      <AuthDivider />

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <FieldShell htmlFor="email" label="Work email">
          <AuthInput
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isBusy}
            icon={<Mail className="size-3.5" strokeWidth={2} />}
          />
        </FieldShell>

        <FieldShell
          htmlFor="password"
          label="Password"
          hint={
            <Link
              href="/forgot-password"
              className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground/85 uppercase transition-colors hover:text-primary"
            >
              Forgot?
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
            icon={<Lock className="size-3.5" strokeWidth={2} />}
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

        <p className="text-center text-[11px] leading-relaxed text-muted-foreground lg:hidden">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
