"use client";
import { authClient } from "@/lib/auth/auth-client";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";

export default function VerifyEmailPageContent() {
  const [loading, setLoading] = useState(false);

  async function resendVerificationEmail() {
    if (loading) return;

    setLoading(true);

    const email = localStorage.getItem("pending_verification_email");

    if (!email) {
      toast.error("No email found.");
      return;
    }

    try {
      await authClient.sendVerificationEmail({
        email: email,
        callbackURL: "/dashboard",
      });

      toast.success("Verification email sent successfully.");
    } catch {
      toast.error("Failed to send verification email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md border rounded-2xl p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Verify your email</h1>

          <p className="text-sm text-gray-500">
            We sent a verification link to your email address. Please verify
            your account to continue.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={resendVerificationEmail}
            disabled={loading}
            className="w-full border rounded-lg py-2 cursor-pointer"
          >
            {loading ? "Sending..." : "Resend verification email"}
          </button>

          <Link href="/signin" className="text-sm text-center underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
