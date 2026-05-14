import type { CSSProperties, ReactNode } from "react";

/**
 * Auth route-group palette. These overrides win over the global dark theme
 * by virtue of inline-style specificity, so every primitive that reads
 * --background / --card / --primary / etc. picks them up automatically.
 */
const AUTH_TOKENS = {
  "--background": "#080B0C",
  "--foreground": "#FAFAFA",
  "--card": "#111113",
  "--card-foreground": "#FAFAFA",
  "--popover": "#111113",
  "--popover-foreground": "#FAFAFA",
  "--primary": "#84CC16",
  "--primary-foreground": "#0A0F02",
  "--secondary": "#15151A",
  "--secondary-foreground": "#FAFAFA",
  "--muted": "#141417",
  "--muted-foreground": "#7A7A82",
  "--accent": "#15151A",
  "--accent-foreground": "#FAFAFA",
  "--destructive": "#F87171",
  "--border": "#1F1F22",
  "--input": "#1F1F22",
  "--ring": "#84CC16",
} as CSSProperties;

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dark min-h-screen bg-background" style={AUTH_TOKENS}>
      {children}
    </div>
  );
}
