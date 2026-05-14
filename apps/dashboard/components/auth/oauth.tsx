"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { GitHubIcon, GoogleIcon } from "./icons";

export type OAuthProvider = "google" | "github";

/**
 * OAuthGroup — the two-up Google / GitHub button row.
 */
export function OAuthGroup({
  loadingProvider,
  disabled,
  onSelect,
}: {
  loadingProvider: OAuthProvider | null;
  disabled: boolean;
  onSelect: (provider: OAuthProvider) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <OAuthButton
        onClick={() => onSelect("google")}
        disabled={disabled}
        loading={loadingProvider === "google"}
        icon={<GoogleIcon className="size-4" />}
        label="Google"
      />
      <OAuthButton
        onClick={() => onSelect("github")}
        disabled={disabled}
        loading={loadingProvider === "github"}
        icon={<GitHubIcon className="size-4" />}
        label="GitHub"
      />
    </div>
  );
}

function OAuthButton({
  onClick,
  disabled,
  loading,
  icon,
  label,
}: {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative inline-flex h-10 items-center justify-center gap-2.5 rounded-md border border-border/70 bg-card/40 px-3 text-[12.5px] font-medium text-foreground/90",
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
      <span className="flex size-4 items-center justify-center">
        {loading ? (
          <Loader2
            className="size-3.5 animate-spin text-muted-foreground"
            strokeWidth={2}
          />
        ) : (
          icon
        )}
      </span>
      <span className="tracking-tight">{label}</span>
    </button>
  );
}
