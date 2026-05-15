import {
  ctaButton,
  emailLayout,
  eyebrow,
  fallbackLink,
  heading,
  infoCard,
  noticeCard,
  paragraph,
  spacer,
  statusBadge,
} from "./_primitives";

export function verificationEmailTemplate(url: string): string {
  const body = `
    ${statusBadge({ label: "Action required", tone: "info" })}
    ${spacer(18)}
    ${eyebrow("Verify email")}
    ${heading("Confirm your email address")}
    ${paragraph(
      "Welcome to TryNotifly. Verify this address to activate your account and unlock email, SMS, WhatsApp, and push delivery from a single API.",
    )}
    ${ctaButton({ href: url, label: "Verify email" })}
    ${spacer(20)}
    ${infoCard({
      label: "Request details",
      rows: [
        { key: "Action", value: "Email verification" },
        { key: "Link expires", value: "in 24 hours" },
        { key: "Single-use", value: "Yes" },
      ],
    })}
    ${spacer(20)}
    ${noticeCard({
      tone: "info",
      body: `If you didn't create a TryNotifly account, you can safely ignore this email — no further action is needed.`,
    })}
    ${fallbackLink(url)}
  `;

  return emailLayout({
    title: "Verify your email · TryNotifly",
    preheader:
      "Confirm your email to finish setting up your TryNotifly account.",
    body,
  });
}

