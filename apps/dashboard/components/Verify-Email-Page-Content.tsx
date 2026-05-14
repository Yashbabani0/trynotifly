"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { toast } from "react-toastify";
import { Loader2, RefreshCcw } from "lucide-react";

import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";
import {
  AuthHeader,
  AuthLeftPanel,
  AuthShell,
  Highlight,
  MobileTopRightLink,
  PulsingMailIcon,
  TopRightLink,
  VerifyStatusCard,
} from "@/components/auth";

function subscribeToStorage(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function readPendingEmail() {
  return localStorage.getItem("pending_verification_email");
}

export default function VerifyEmailPageContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const email = useSyncExternalStore(
    subscribeToStorage,
    readPendingEmail,
    () => null,
  );

  async function resendVerificationEmail() {
    if (loading) return;
    setLoading(true);

    const target =
      email ?? localStorage.getItem("pending_verification_email");

    if (!target) {
      toast.error("No email found.");
      setLoading(false);
      return;
    }

    try {
      await authClient.sendVerificationEmail({
        email: target,
        callbackURL: "/dashboard",
      });
      toast.success("Verification email sent successfully.");
    } catch {
      toast.error("Failed to send verification email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let checking = false;
    const interval = setInterval(async () => {
      if (checking) return;
      checking = true;
      try {
        const session = await authClient.getSession();
        if (session.data?.user?.emailVerified) {
          localStorage.removeItem("pending_verification_email");
          clearInterval(interval);
          router.replace("/dashboard");
          router.refresh();
        }
      } catch {
        // ignore
      } finally {
        checking = false;
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <AuthShell
      leftPanel={
        <AuthLeftPanel
          tag="verifying inbox"
          headline={
            <>
              One link to go.
              <br />
              <Highlight>We&apos;re watching</Highlight> for it.
            </>
          }
          description="We poll your session every few seconds — the moment your email is verified, we'll drop you straight into the dashboard."
          supportCard={<VerifyStatusCard email={email} />}
        />
      }
      topRight={
        <TopRightLink
          prompt="Wrong account?"
          href="/signin"
          cta="Sign in instead"
        />
      }
      mobileTopRight={<MobileTopRightLink href="/signin" label="Sign in" />}
    >
      <AuthHeader
        eyebrow="00 · Verify email"
        title="Check your inbox"
        description={
          email
            ? "We sent a verification link to your inbox. This page will refresh automatically once you confirm."
            : "We sent a verification link to your inbox. Open it from this device to continue."
        }
      />

      <div className="flex items-start gap-3.5 rounded-md border border-border/70 bg-card/30 px-3.5 py-3">
        <PulsingMailIcon />
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground/85 uppercase">
            Awaiting confirmation
          </p>
          <p className="truncate text-[13px] font-medium tracking-tight text-foreground">
            {email ?? "your inbox"}
          </p>
        </div>
        <span className="mt-1 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] text-muted-foreground/70 uppercase">
          <Loader2 className="size-3 animate-spin" strokeWidth={2.25} />
          polling
        </span>
      </div>

      <button
        type="button"
        onClick={resendVerificationEmail}
        disabled={loading}
        className={cn(
          "group mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border/70 bg-card/40 px-3 text-[12.5px] font-medium text-foreground/90",
          "transition-all duration-200 ease-out",
          "hover:-translate-y-px hover:border-border hover:bg-card/70 hover:text-foreground",
          "active:translate-y-0 active:bg-card/55",
          "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
          "disabled:pointer-events-none disabled:opacity-55",
        )}
        style={{
          boxShadow:
            "inset 0 1px 0 0 color-mix(in oklch, var(--foreground) 5%, transparent), 0 1px 0 0 color-mix(in oklch, black 25%, transparent), 0 1px 2px -1px color-mix(in oklch, black 30%, transparent)",
        }}
      >
        {loading ? (
          <>
            <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
            <span>Sending…</span>
          </>
        ) : (
          <>
            <RefreshCcw
              className="size-3.5 transition-transform duration-300 group-hover:rotate-180"
              strokeWidth={2}
            />
            <span>Resend verification email</span>
          </>
        )}
      </button>

      <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">
        Didn&apos;t mean to land here?{" "}
        <Link
          href="/signin"
          className="text-foreground underline-offset-4 hover:underline"
        >
          Sign in with a different account
        </Link>
      </p>
    </AuthShell>
  );
}
