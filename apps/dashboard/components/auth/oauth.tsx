"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { GitHubIcon, GoogleIcon } from "./icons";

export type OAuthProvider = "google" | "github";

/**
 * OAuthGroup — Google + GitHub buttons side-by-side.
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
    <div className="grid grid-cols-2 gap-2.5">
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
        "group inline-flex h-11 items-center justify-center gap-2.5 rounded-md border border-border bg-card px-3 text-[12.5px] font-medium text-foreground/90",
        "transition-[background-color,border-color,color] duration-150 ease-out",
        "hover:border-border/80 hover:bg-card/80 hover:text-foreground",
        "active:bg-card/60",
        "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-55",
      )}
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
