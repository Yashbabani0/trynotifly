"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { toast } from "react-toastify";
import { Loader2, Mail, RefreshCcw } from "lucide-react";

import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";
import {
  AuthBottomLink,
  AuthHeader,
  AuthShell,
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
  const [sentRecently, setSentRecently] = useState(false);
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
      toast.error("We couldn't find an email to verify. Please sign in again.");
      setLoading(false);
      return;
    }

    try {
      await authClient.sendVerificationEmail({
        email: target,
        callbackURL: "/dashboard",
      });
      setSentRecently(true);
      toast.success("Verification email sent. Check your inbox.");
      setTimeout(() => setSentRecently(false), 30_000);
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
    <AuthShell>
      <AuthHeader
        eyebrow="00 · Verify email"
        title="Check your inbox"
        description={
          email
            ? `We sent a verification link to ${email}. This page refreshes automatically once you confirm.`
            : "We sent a verification link to your inbox. Open it from this device to continue."
        }
      />

      {/* Status banner */}
      <div className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-primary"
          style={{
            boxShadow:
              "inset 0 0 0 1px color-mix(in oklch, var(--primary) 15%, transparent)",
          }}
        >
          <Mail className="size-4" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-medium tracking-tight text-foreground">
            Awaiting confirmation
          </p>
          <p className="truncate text-[11.5px] text-muted-foreground">
            {email ?? "your inbox"}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] text-muted-foreground/80 uppercase">
          <Loader2 className="size-3 animate-spin" strokeWidth={2.5} />
          polling
        </span>
      </div>

      {/* Resend */}
      <button
        type="button"
        onClick={resendVerificationEmail}
        disabled={loading || sentRecently}
        className={cn(
          "group mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-[13.5px] font-medium text-foreground/90",
          "transition-[background-color,border-color,color] duration-150 ease-out",
          "hover:border-border/80 hover:bg-card/80 hover:text-foreground",
          "active:bg-card/60",
          "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
          "disabled:pointer-events-none disabled:opacity-55",
        )}
      >
        {loading ? (
          <>
            <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
            <span>Sending…</span>
          </>
        ) : sentRecently ? (
          <span>Email sent — check your inbox</span>
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

      <p className="mt-3 text-center text-[11.5px] leading-relaxed text-muted-foreground">
        Can&apos;t find it? Check your spam folder.
      </p>

      <AuthBottomLink
        prompt="Wrong account?"
        href="/signin"
        cta="Sign in with a different one"
      />
    </AuthShell>
  );
}
