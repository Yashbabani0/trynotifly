"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { InlineNotice } from "@/components/auth/form-field";
import { acceptInvitationAction } from "@/app/(onboarding)/accept-invitation/actions";

export function AcceptInvitationForm({ invitationId }: { invitationId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function accept() {
    setError(null);
    startTransition(async () => {
      const result = await acceptInvitationAction(invitationId);

      if (result && !result.ok) {
        setError(result.message);
      }
    });
  }

  return (
    <div className="space-y-4">
      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}
      {!invitationId ? (
        <InlineNotice tone="error">This invitation link is missing an id.</InlineNotice>
      ) : null}
      <Button onClick={accept} disabled={isPending || !invitationId} className="w-full">
        {isPending ? "Accepting..." : "Accept invitation"}
      </Button>
      <Button asChild variant="outline" className="w-full">
        <Link href="/signIn">Sign in with another account</Link>
      </Button>
    </div>
  );
}
